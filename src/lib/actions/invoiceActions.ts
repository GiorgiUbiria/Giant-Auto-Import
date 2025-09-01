"use server";

import { z } from "zod";
import { createServerAction } from "zsa";
import { isAdminProcedure } from "./authProcedures";
import { db } from "../drizzle/db";
import { invoices, cars, insertInvoiceSchema, selectInvoiceSchema } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { S3 } from "@aws-sdk/client-s3";
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import "dotenv/config";

// S3 Client configuration for Cloudflare R2
const getS3Client = () => {
  const required = [
    'CLOUDFLARE_API_ENDPOINT',
    'CLOUDFLARE_ACCESS_KEY_ID',
    'CLOUDFLARE_SECRET_ACCESS_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  const endpoint = process.env.CLOUDFLARE_API_ENDPOINT as string;
  const accessKeyId = process.env.CLOUDFLARE_ACCESS_KEY_ID as string;
  const secretAccessKey = process.env.CLOUDFLARE_SECRET_ACCESS_KEY as string;

  return new S3({
    region: "auto",
    endpoint: endpoint,
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    },
    forcePathStyle: true,
  });
};

const getBucketName = () => {
  if (!process.env.CLOUDFLARE_BUCKET_NAME) {
    throw new Error('Missing CLOUDFLARE_BUCKET_NAME environment variable');
  }
  return process.env.CLOUDFLARE_BUCKET_NAME as string;
};

// Upload invoice file
export const uploadInvoiceAction = isAdminProcedure
  .createServerAction()
  .input(
    z.object({
      carVin: z.string(),
      invoiceType: z.enum(["PURCHASE", "SHIPPING", "TOTAL"]),
      file: z.object({
        buffer: z.array(z.number()).transform(arr => new Uint8Array(arr)),
        name: z.string(),
        size: z.number(),
        type: z.string(),
      }),
    })
  )
  .handler(async ({ input, ctx }) => {
    const { carVin, invoiceType, file } = input;
    const adminId = ctx.user.id;

    console.log("uploadInvoiceAction: Starting upload for", { carVin, invoiceType, fileName: file.name, fileSize: file.size });

    try {
      // Check if car exists
      const car = await db.query.cars.findFirst({
        where: eq(cars.vin, carVin),
      });

      if (!car) {
        console.error("uploadInvoiceAction: Car not found for VIN:", carVin);
        throw new Error("Car not found");
      }

      console.log("uploadInvoiceAction: Car found, proceeding with upload");

      // Check if invoice already exists for this car and type
      const existingInvoice = await db.query.invoices.findFirst({
        where: and(
          eq(invoices.carVin, carVin),
          eq(invoices.invoiceType, invoiceType)
        ),
      });

      // Generate file key using the pattern: vin/type/invoice.pdf
      const fileExtension = file.name.split('.').pop() || 'pdf';
      const fileKey = `${carVin}/${invoiceType.toLowerCase()}/invoice.${fileExtension}`;

      console.log("uploadInvoiceAction: Generated file key:", fileKey);

      // If old invoice exists, delete it from R2 first
      if (existingInvoice) {
        console.log("uploadInvoiceAction: Deleting old invoice from R2:", existingInvoice.fileKey);
        try {
          const S3Client = getS3Client();
          const bucketName = getBucketName();

          const deleteCommand = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: existingInvoice.fileKey,
          });

          await S3Client.send(deleteCommand);
          console.log("uploadInvoiceAction: Old invoice deleted from R2 successfully");
        } catch (deleteError) {
          console.warn("uploadInvoiceAction: Failed to delete old invoice from R2:", deleteError);
          // Continue with upload even if deletion fails
        }
      }

      // Upload to R2 storage
      const S3Client = getS3Client();
      const bucketName = getBucketName();

      console.log("uploadInvoiceAction: Uploading to R2 bucket:", bucketName);
      console.log("uploadInvoiceAction: S3 client endpoint:", process.env.CLOUDFLARE_API_ENDPOINT);

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
        Body: file.buffer,
        ContentLength: file.size,
        ContentType: file.type,
        Metadata: {
          'original-name': file.name,
          'upload-timestamp': new Date().toISOString(),
          'file-size': file.size.toString(),
          'invoice-type': invoiceType,
          'car-vin': carVin,
        },
      });

      try {
        await S3Client.send(command);
        console.log("uploadInvoiceAction: File successfully uploaded to R2");
      } catch (r2Error) {
        console.error("uploadInvoiceAction: R2 upload failed:", r2Error);
        if (r2Error instanceof Error) {
          throw new Error(`R2 upload failed: ${r2Error.message}`);
        }
        throw new Error("R2 upload failed with unknown error");
      }

      // Insert or update invoice record to database
      console.log("uploadInvoiceAction: Updating invoice record in database");

      if (existingInvoice) {
        // Update existing invoice record
        const [updatedInvoice] = await db
          .update(invoices)
          .set({
            fileKey,
            fileName: file.name,
            fileSize: file.size,
            uploadedBy: adminId,
            uploadedAt: new Date(),
          })
          .where(eq(invoices.id, existingInvoice.id))
          .returning();

        console.log("uploadInvoiceAction: Invoice record updated:", updatedInvoice);
        return { success: true, invoice: updatedInvoice, replaced: true };
      } else {
        // Insert new invoice record
        const [newInvoice] = await db.insert(invoices).values({
          carVin,
          invoiceType,
          fileKey,
          fileName: file.name,
          fileSize: file.size,
          uploadedBy: adminId,
        }).returning();

        console.log("uploadInvoiceAction: New invoice record inserted:", newInvoice);
        return { success: true, invoice: newInvoice, replaced: false };
      }
    } catch (error) {
      console.error("uploadInvoiceAction: Error occurred:", error);

      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes("Missing required environment variables")) {
          throw new Error("R2 storage configuration error. Please check environment variables.");
        } else if (error.message.includes("Car not found")) {
          throw new Error("Car not found in database.");
        } else if (error.message.includes("R2 upload failed")) {
          throw new Error(`File upload to storage failed: ${error.message}`);
        } else {
          throw new Error(`Upload failed: ${error.message}`);
        }
      }

      throw new Error("Unknown error occurred during upload");
    }
  });

// Get invoice download URL
export const getInvoiceDownloadUrlAction = createServerAction()
  .input(
    z.object({
      carVin: z.string(),
      invoiceType: z.enum(["PURCHASE", "SHIPPING", "TOTAL"]),
    })
  )
  .handler(async ({ input }) => {
    const { carVin, invoiceType } = input;

    try {
      // Get invoice record
      const invoice = await db.query.invoices.findFirst({
        where: and(
          eq(invoices.carVin, carVin),
          eq(invoices.invoiceType, invoiceType)
        ),
      });

      if (!invoice) {
        throw new Error("Invoice not found");
      }

      // Generate signed download URL
      const S3Client = getS3Client();
      const bucketName = getBucketName();

      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: invoice.fileKey,
      });

      const signedUrl = await getSignedUrl(S3Client, command, {
        expiresIn: 3600, // 1 hour
      });

      return {
        downloadUrl: signedUrl,
        fileName: invoice.fileName,
        fileSize: invoice.fileSize,
      };
    } catch (error) {
      console.error("Error getting invoice download URL:", error);
      throw error;
    }
  });

// Get all invoices for a car
export const getCarInvoicesAction = createServerAction()
  .input(
    z.object({
      carVin: z.string(),
    })
  )
  .handler(async ({ input }) => {
    const { carVin } = input;

    try {
      const carInvoices = await db.query.invoices.findMany({
        where: eq(invoices.carVin, carVin),
        orderBy: [desc(invoices.uploadedAt)],
        with: {
          uploadedByUser: {
            columns: {
              fullName: true,
            },
          },
        },
      });

      return carInvoices;
    } catch (error) {
      console.error("Error fetching car invoices:", error);
      throw error;
    }
  });

// Delete invoice (admin only)
export const deleteInvoiceAction = isAdminProcedure
  .createServerAction()
  .input(
    z.object({
      invoiceId: z.number(),
    })
  )
  .handler(async ({ input }) => {
    const { invoiceId } = input;

    try {
      // Get invoice details before deletion
      const invoice = await db.query.invoices.findFirst({
        where: eq(invoices.id, invoiceId),
      });

      if (!invoice) {
        throw new Error("Invoice not found");
      }

      console.log("deleteInvoiceAction: Deleting invoice from R2:", invoice.fileKey);

      // Delete from R2 storage
      const S3Client = getS3Client();
      const bucketName = getBucketName();

      const deleteCommand = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: invoice.fileKey,
      });

      try {
        await S3Client.send(deleteCommand);
        console.log("deleteInvoiceAction: Invoice deleted from R2 successfully");
      } catch (r2Error) {
        console.error("deleteInvoiceAction: Failed to delete from R2:", r2Error);
        // Continue with database deletion even if R2 deletion fails
      }

      // Delete from database
      await db.delete(invoices).where(eq(invoices.id, invoiceId));
      console.log("deleteInvoiceAction: Invoice record deleted from database");

      return { success: true };
    } catch (error) {
      console.error("deleteInvoiceAction: Error deleting invoice:", error);
      throw error;
    }
  });

// Check if invoice exists for a car and type
export const checkInvoiceExistsAction = createServerAction()
  .input(
    z.object({
      carVin: z.string(),
      invoiceType: z.enum(["PURCHASE", "SHIPPING", "TOTAL"]),
    })
  )
  .handler(async ({ input }) => {
    const { carVin, invoiceType } = input;

    try {
      const invoice = await db.query.invoices.findFirst({
        where: and(
          eq(invoices.carVin, carVin),
          eq(invoices.invoiceType, invoiceType)
        ),
        columns: {
          id: true,
          fileName: true,
          uploadedAt: true,
        },
      });

      return {
        exists: !!invoice,
        invoice: invoice || null,
      };
    } catch (error) {
      console.error("Error checking invoice existence:", error);
      throw error;
    }
  });

// Clean up all invoice files for a specific car VIN
export const cleanUpInvoicesForVin = async (carVin: string): Promise<void> => {
  try {
    console.log("cleanUpInvoicesForVin: Starting cleanup for VIN:", carVin);

    // Get all invoices for this car
    const carInvoices = await db.query.invoices.findMany({
      where: eq(invoices.carVin, carVin),
      columns: {
        fileKey: true,
      },
    });

    if (carInvoices.length === 0) {
      console.log("cleanUpInvoicesForVin: No invoices found for VIN:", carVin);
      return;
    }

    console.log("cleanUpInvoicesForVin: Found", carInvoices.length, "invoices to delete");

    // Delete from R2 storage
    const S3Client = getS3Client();
    const bucketName = getBucketName();

    for (const invoice of carInvoices) {
      try {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: bucketName,
          Key: invoice.fileKey,
        });

        await S3Client.send(deleteCommand);
        console.log("cleanUpInvoicesForVin: Deleted invoice from R2:", invoice.fileKey);
      } catch (r2Error) {
        console.error("cleanUpInvoicesForVin: Failed to delete invoice from R2:", invoice.fileKey, r2Error);
        // Continue with other deletions
      }
    }

    // Delete all invoice records from database
    await db.delete(invoices).where(eq(invoices.carVin, carVin));
    console.log("cleanUpInvoicesForVin: All invoice records deleted from database for VIN:", carVin);

  } catch (error) {
    console.error("cleanUpInvoicesForVin: Error during cleanup:", error);
    throw error;
  }
};
