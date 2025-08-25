"use server";

import { z } from "zod";
import { createServerAction } from "zsa";
import { isAdminProcedure } from "./authProcedures";
import { db } from "@/lib/drizzle/db";
import { noteAttachments, customerNotes } from "@/lib/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getAuth } from "@/lib/auth";

// S3/R2 client configuration
const getS3Client = () => {
  const accessKeyId = process.env.CLOUDFLARE_ACCESS_KEY_ID;
  const secretAccessKey = process.env.CLOUDFLARE_SECRET_ACCESS_KEY;
  const region = process.env.R2_REGION || "auto";
  const endpoint = process.env.CLOUDFLARE_API_ENDPOINT;

  if (!accessKeyId || !secretAccessKey || !endpoint) {
    throw new Error("Missing R2 configuration");
  }

  return new S3Client({
    region,
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true,
  });
};

const getBucketName = () => {
  const bucketName = process.env.CLOUDFLARE_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("Missing R2 bucket name");
  }
  return bucketName;
};

// Upload note attachments
export const uploadNoteAttachmentsAction = isAdminProcedure
  .createServerAction()
  .input(
    z.object({
      noteId: z.number(),
      files: z.array(z.object({
        fileName: z.string(),
        buffer: z.array(z.number()).transform(arr => new Uint8Array(arr)),
        fileType: z.string(),
        fileSize: z.number(),
      })).max(10), // Maximum 10 files
    })
  )
  .handler(async ({ input, ctx }) => {
    const { noteId, files } = input;
    const adminId = ctx.user.id;

    try {
      // Verify note exists and user has access
      const note = await db.query.customerNotes.findFirst({
        where: eq(customerNotes.id, noteId),
        with: {
          customer: true,
        },
      });

      if (!note) {
        throw new Error("Note not found");
      }

      // Check if user is admin (only admins can upload attachments)
      if (ctx.user.role !== "ADMIN") {
        throw new Error("Only admins can upload note attachments");
      }

      const s3Client = getS3Client();
      const bucketName = getBucketName();
      const uploadedFiles: any[] = [];

      // Upload each file to R2
      for (const file of files) {
        const fileKey = `notes/${noteId}/${Date.now()}_${file.fileName}`;

        try {
          await s3Client.send(
            new PutObjectCommand({
              Bucket: bucketName,
              Key: fileKey,
              Body: file.buffer,
              ContentType: file.fileType,
              Metadata: {
                originalName: file.fileName,
                uploadedBy: adminId,
              },
            })
          );

          // Insert attachment record
          const attachment = await db.insert(noteAttachments).values({
            noteId,
            fileName: file.fileName,
            fileKey,
            fileSize: file.fileSize,
            fileType: file.fileType,
            uploadedBy: adminId,
          }).returning();

          uploadedFiles.push(attachment[0]);
        } catch (error) {
          console.error("Failed to upload file:", error);
          throw new Error(`Failed to upload ${file.fileName}`);
        }
      }

      // Update note to indicate it has attachments
      await db.update(customerNotes)
        .set({ hasAttachments: true })
        .where(eq(customerNotes.id, noteId));

      return uploadedFiles;
    } catch (error) {
      console.error("Upload note attachments error:", error);
      throw error;
    }
  });

// Get note attachments
export const getNoteAttachmentsAction = createServerAction()
  .input(z.object({ noteId: z.number() }))
  .handler(async ({ input }) => {
    try {
      const { noteId } = input;
      const auth = await getAuth();
      const userId = auth?.user?.id;

      if (!userId || !auth?.user) {
        throw new Error("Unauthorized");
      }

      // Verify note exists and user has access
      const note = await db.query.customerNotes.findFirst({
        where: eq(customerNotes.id, noteId),
        with: {
          customer: true,
        },
      });

      if (!note) {
        throw new Error("Note not found");
      }

      // Check if user is admin or the note is about their own customer
      if (auth.user.role !== "ADMIN" && note.customerId !== userId) {
        throw new Error("Unauthorized to access this note");
      }

      const attachments = await db.query.noteAttachments.findMany({
        where: eq(noteAttachments.noteId, noteId),
        with: {
          uploadedByUser: {
            columns: {
              fullName: true,
            },
          },
        },
        orderBy: (noteAttachments, { desc }) => [desc(noteAttachments.uploadedAt)],
      });

      return attachments;
    } catch (error) {
      console.error("Get note attachments error:", error);
      throw error;
    }
  });

// Delete note attachment
export const deleteNoteAttachmentAction = isAdminProcedure
  .createServerAction()
  .input(z.object({ attachmentId: z.number() }))
  .handler(async ({ input, ctx }) => {
    try {
      const { attachmentId } = input;
      const adminId = ctx.user.id;

      // Get attachment with note info
      const attachment = await db.query.noteAttachments.findFirst({
        where: eq(noteAttachments.id, attachmentId),
        with: {
          note: {
            with: {
              customer: true,
            },
          },
        },
      });

      if (!attachment) {
        throw new Error("Attachment not found");
      }

      // Check if user is admin (only admins can delete attachments)
      if (ctx.user.role !== "ADMIN") {
        throw new Error("Only admins can delete note attachments");
      }

      // Delete from R2
      const s3Client = getS3Client();
      const bucketName = getBucketName();

      try {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: bucketName,
            Key: attachment.fileKey,
          })
        );
      } catch (error) {
        console.error("Failed to delete file from R2:", error);
        // Continue with database deletion even if R2 deletion fails
      }

      // Delete from database
      await db.delete(noteAttachments).where(eq(noteAttachments.id, attachmentId));

      // Check if note still has attachments
      const remainingAttachments = await db.query.noteAttachments.findMany({
        where: eq(noteAttachments.noteId, attachment.note.id),
      });

      if (remainingAttachments.length === 0) {
        await db.update(customerNotes)
          .set({ hasAttachments: false })
          .where(eq(customerNotes.id, attachment.note.id));
      }

      return { success: true };
    } catch (error) {
      console.error("Delete note attachment error:", error);
      throw error;
    }
  });

// Get download URL for note attachment
export const getNoteAttachmentDownloadUrlAction = createServerAction()
  .input(z.object({ attachmentId: z.number() }))
  .handler(async ({ input }) => {
    try {
      const { attachmentId } = input;
      const auth = await getAuth();
      const userId = auth?.user?.id;

      if (!userId || !auth?.user) {
        throw new Error("Unauthorized");
      }

      // Get attachment with note info
      const attachment = await db.query.noteAttachments.findFirst({
        where: eq(noteAttachments.id, attachmentId),
        with: {
          note: {
            with: {
              customer: true,
            },
          },
        },
      });

      if (!attachment) {
        throw new Error("Attachment not found");
      }

      // Check if user is admin or the note is about their own customer
      if (auth.user.role !== "ADMIN" && attachment.note.customerId !== userId) {
        throw new Error("Unauthorized to access this attachment");
      }

      const s3Client = getS3Client();
      const bucketName = getBucketName();

      // Generate presigned URL (expires in 1 hour)
      const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
      const { GetObjectCommand } = await import("@aws-sdk/client-s3");

      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: attachment.fileKey,
      });

      const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

      return { downloadUrl, fileName: attachment.fileName };
    } catch (error) {
      console.error("Get note attachment download URL error:", error);
      throw error;
    }
  });
