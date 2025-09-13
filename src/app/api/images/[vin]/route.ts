import { getPublicUrlForKey, getSignedUrlForKey } from "@/lib/actions/bucketActions";
import { addCorsHeaders, createCorsResponse, handleCorsPreflight } from "@/lib/cors";
import { db } from "@/lib/drizzle/db";
import { images } from "@/lib/drizzle/schema";
import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3,
} from "@aws-sdk/client-s3";
import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Handle CORS preflight requests
export async function OPTIONS() {
  return handleCorsPreflight();
}

export async function GET(request: Request, { params }: { params: { vin: string } }) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    const vin = params.vin;
    const type = searchParams.get("type") || undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSizeParam = parseInt(searchParams.get("pageSize") || "12", 10);
    const pageSize = Number.isNaN(pageSizeParam) ? 12 : pageSizeParam === 0 ? 1000 : pageSizeParam;
    const mode = searchParams.get("mode");

    const isSingleMode = mode === "single";

    if (isSingleMode) {
      // Return a single prioritized image (thumbnail even-index URL)
      // 1) get prioritized image; fallback to latest
      let record = await db
        .select()
        .from(images)
        .where(and(eq(images.carVin, vin), eq(images.priority, true)) as any)
        .limit(1);

      if (!record || record.length === 0) {
        record = await db
          .select()
          .from(images)
          .where(eq(images.carVin, vin) as any)
          .orderBy(desc(images.id))
          .limit(1);
      }

      if (!record || record.length === 0) {
        return createCorsResponse({ data: null });
      }

      const selected = record[0];
      const key = selected.imageKey!;

      const usePublic = !!process.env.NEXT_PUBLIC_BUCKET_URL;
      console.log(
        `API: Single image mode - usePublic = ${usePublic}, NEXT_PUBLIC_BUCKET_URL = ${process.env.NEXT_PUBLIC_BUCKET_URL}`
      );
      const imageUrl = usePublic ? await getPublicUrlForKey(key) : await getSignedUrlForKey(key);
      console.log(`API: Single image URL for ${key}: ${imageUrl}`);

      return createCorsResponse({
        data: {
          url: imageUrl,
          carVin: vin,
          imageKey: key,
          imageType: selected.imageType,
          priority: selected.priority ?? false,
        },
      });
    }

    const whereClause = type
      ? and(eq(images.carVin, vin), eq(images.imageType, type as any))
      : eq(images.carVin, vin);

    // Fetch all images, apply pagination in memory
    let allRecords = await db
      .select()
      .from(images)
      .where(whereClause as any)
      .orderBy(desc(images.priority), desc(images.id));

    // Use all records since we don't create separate thumbnails anymore
    const count = allRecords.length;
    const effectivePageSize = pageSize === 0 ? Math.max(1, count) : pageSize;
    const totalPages = pageSize === 0 ? 1 : Math.max(1, Math.ceil(count / effectivePageSize));
    const currentPage = pageSize === 0 ? 1 : Math.min(page, totalPages);
    const start = pageSize === 0 ? 0 : (currentPage - 1) * effectivePageSize;
    const end = pageSize === 0 ? count : start + effectivePageSize;
    const records = allRecords.slice(start, end);

    const usePublic = !!process.env.NEXT_PUBLIC_BUCKET_URL;
    console.log(
      `API: usePublic = ${usePublic}, NEXT_PUBLIC_BUCKET_URL = ${process.env.NEXT_PUBLIC_BUCKET_URL}`
    );

    const items = await Promise.all(
      records.map(async (rec) => {
        try {
          const url = usePublic
            ? await getPublicUrlForKey(rec.imageKey!)
            : await getSignedUrlForKey(rec.imageKey!);
          console.log(`API: Generated URL for ${rec.imageKey}: ${url}`);
          return {
            id: rec.id,
            imageKey: rec.imageKey!,
            imageType: rec.imageType as "AUCTION" | "WAREHOUSE" | "DELIVERY" | "PICK_UP",
            carVin: rec.carVin!,
            priority: rec.priority ?? false,
            url,
          };
        } catch (error) {
          console.error(`API: Error generating URL for ${rec.imageKey}:`, error);
          throw error;
        }
      })
    );

    const response = createCorsResponse({
      images: items,
      count,
      totalPages,
      currentPage,
    });

    // Add cache headers
    response.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    response.headers.set("CDN-Cache-Control", "public, s-maxage=60");
    response.headers.set("Vercel-CDN-Cache-Control", "public, s-maxage=60");
    return response;
  } catch (error) {
    console.error("/api/images/[vin] GET error:", error);
    return createCorsResponse(
      {
        error: "Failed to fetch images",
        details: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
}

export async function POST(request: Request, { params }: { params: { vin: string } }) {
  try {
    const vin = params.vin;

    // Validate VIN format (allow shorter VINs for testing)
    if (!vin || vin.length < 3) {
      return createCorsResponse(
        {
          success: false,
          message: "Invalid VIN format",
        },
        400
      );
    }

    const body = await request.json();
    const { images: imageData } = body;

    if (!imageData || !Array.isArray(imageData) || imageData.length === 0) {
      return createCorsResponse(
        {
          success: false,
          message: "No images provided",
        },
        400
      );
    }

    // Validate image data structure
    const validImageTypes = ["AUCTION", "WAREHOUSE", "DELIVERY", "PICK_UP"];
    for (const image of imageData) {
      if (
        !image.buffer ||
        !Array.isArray(image.buffer) ||
        !image.size ||
        !image.name ||
        !image.type ||
        !validImageTypes.includes(image.type)
      ) {
        return createCorsResponse(
          {
            success: false,
            message: "Invalid image data structure",
          },
          400
        );
      }
    }

    const S3Client = getS3Client();
    const bucketName = getBucketName();
    const uploadedImages: string[] = [];
    const failedImages: string[] = [];

    console.log(`POST /api/images/${vin}: Processing ${imageData.length} images`);

    // Process each image individually for better reliability
    for (const file of imageData) {
      try {
        const prefix = `${vin}/${file.type}/`;

        // Get existing file count for this type
        const listCommand = new ListObjectsV2Command({
          Bucket: bucketName,
          Prefix: prefix,
        });
        const listResult = await S3Client.send(listCommand);
        const existingFileCount = listResult.Contents?.length || 0;

        const key = `${prefix}${existingFileCount + 1}.png`;

        console.log(`Uploading ${file.name} (${file.size} bytes) to ${key}`);

        const command = new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: new Uint8Array(file.buffer),
          ContentLength: file.size,
          ContentType: "image/png",
          Metadata: {
            "original-name": file.name,
            "upload-timestamp": new Date().toISOString(),
            "file-size": file.size.toString(),
            vin: vin,
          },
        });

        await S3Client.send(command);

        // Insert database record with transaction
        await db.transaction(async (tx) => {
          const insertValues = {
            carVin: vin,
            imageType: file.type,
            imageKey: key,
            priority: false, // Default to false, can be set to main later
          };

          await tx.insert(images).values(insertValues);
        });

        uploadedImages.push(key);
        console.log(`Successfully uploaded ${file.name} to ${key}`);
      } catch (error) {
        console.error(`Error uploading image ${file.name} for VIN ${vin}:`, error);
        failedImages.push(file.name);
        // Continue with next file instead of stopping
      }
    }

    console.log(
      `POST /api/images/${vin}: Completed. Uploaded ${uploadedImages.length}/${imageData.length} images`
    );

    const response = {
      success: uploadedImages.length > 0,
      message:
        uploadedImages.length === imageData.length
          ? `All ${uploadedImages.length} images uploaded successfully`
          : `Uploaded ${uploadedImages.length}/${imageData.length} images successfully`,
      uploadedCount: uploadedImages.length,
      totalCount: imageData.length,
      failedCount: failedImages.length,
      failedImages: failedImages,
    };

    // Revalidate relevant paths after successful upload
    if (uploadedImages.length > 0) {
      revalidatePath(`/admin/cars`);
      revalidatePath(`/car/${vin}`);
      revalidatePath(`/admin/edit/${vin}`);
    }

    return addCorsHeaders(
      NextResponse.json(response, {
        status: uploadedImages.length > 0 ? 200 : 400,
      })
    );
  } catch (error) {
    console.error(`POST /api/images/${params.vin} error:`, error);
    return createCorsResponse(
      {
        success: false,
        message: "Failed to upload images",
        error: error instanceof Error ? error.message : String(error),
      },
      500
    );
  }
}

function getS3Client() {
  const endpoint = process.env.CLOUDFLARE_API_ENDPOINT as string;
  const accessKeyId = process.env.CLOUDFLARE_ACCESS_KEY_ID as string;
  const secretAccessKey = process.env.CLOUDFLARE_SECRET_ACCESS_KEY as string;
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("Missing Cloudflare R2 environment configuration");
  }
  return new S3({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
    maxAttempts: 3,
    retryMode: "adaptive",
  });
}

function getBucketName() {
  const bucket = process.env.CLOUDFLARE_BUCKET_NAME as string;
  if (!bucket) throw new Error("CLOUDFLARE_BUCKET_NAME not set");
  return bucket;
}

async function getNextIndexForPrefix(client: S3, bucket: string, prefix: string) {
  const command = new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix });
  let maxIndex = 0;
  let truncated = true;
  while (truncated) {
    const res: any = await client.send(command);
    const contents = res.Contents || [];
    for (const obj of contents) {
      if (obj.Key && obj.Key.startsWith(prefix)) {
        const name = obj.Key.slice(prefix.length);
        const [numStr] = name.split(".");
        const n = parseInt(numStr, 10);
        if (!Number.isNaN(n)) maxIndex = Math.max(maxIndex, n);
      }
    }
    truncated = res.IsTruncated as boolean;
    if (truncated) command.input.ContinuationToken = res.NextContinuationToken;
  }
  return maxIndex + 1;
}

export async function PATCH(request: Request, { params }: { params: { vin: string } }) {
  try {
    const vin = params.vin;
    const { action, imageKey } = await request.json();

    if (action !== "makeMain" || !imageKey) {
      return createCorsResponse(
        {
          success: false,
          error: "Invalid request. Action must be 'makeMain' and imageKey is required",
        },
        400
      );
    }

    // Validate VIN format (allow shorter VINs for testing)
    if (!vin || vin.length < 3) {
      return createCorsResponse(
        {
          success: false,
          error: "Invalid VIN format",
        },
        400
      );
    }

    // Use transaction to ensure atomicity
    await db.transaction(async (tx) => {
      // First, verify the image exists and belongs to this VIN
      const imageRecord = await tx
        .select()
        .from(images)
        .where(and(eq(images.imageKey, imageKey), eq(images.carVin, vin)))
        .limit(1);

      if (imageRecord.length === 0) {
        throw new Error("Image not found or does not belong to this VIN");
      }

      // Reset all priorities for this car to false
      await tx.update(images).set({ priority: false }).where(eq(images.carVin, vin));

      // Set the selected image as priority
      await tx.update(images).set({ priority: true }).where(eq(images.imageKey, imageKey));
    });

    console.log(`Successfully set image ${imageKey} as main for VIN ${vin}`);

    // Revalidate relevant paths after successful update
    revalidatePath(`/admin/cars`);
    revalidatePath(`/car/${vin}`);
    revalidatePath(`/admin/edit/${vin}`);

    return createCorsResponse({
      success: true,
      message: "Image set as main successfully",
    });
  } catch (error) {
    console.error("/api/images/[vin] PATCH error:", error);
    return createCorsResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update image",
      },
      500
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { vin: string } }) {
  try {
    const vin = params.vin;
    const url = new URL(request.url);
    const imageKey = url.searchParams.get("imageKey");

    // Validate VIN format (allow shorter VINs for testing)
    if (!vin || vin.length < 3) {
      return createCorsResponse(
        {
          success: false,
          error: "Invalid VIN format",
        },
        400
      );
    }

    const client = getS3Client();
    const bucket = getBucketName();

    if (imageKey) {
      // Delete specific image
      try {
        // Verify image exists and belongs to this VIN
        const imageRecord = await db
          .select()
          .from(images)
          .where(and(eq(images.imageKey, imageKey), eq(images.carVin, vin)))
          .limit(1);

        if (imageRecord.length === 0) {
          return createCorsResponse(
            {
              success: false,
              error: "Image not found or does not belong to this VIN",
            },
            404
          );
        }

        // Delete from S3
        await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: imageKey }));

        // Delete from database
        await db.delete(images).where(eq(images.imageKey, imageKey));

        console.log(`Successfully deleted image ${imageKey} for VIN ${vin}`);

        // Revalidate relevant paths after successful deletion
        revalidatePath(`/admin/cars`);
        revalidatePath(`/car/${vin}`);
        revalidatePath(`/admin/edit/${vin}`);

        return createCorsResponse({
          success: true,
          message: "Image deleted successfully",
        });
      } catch (error) {
        console.error(`Error deleting image ${imageKey}:`, error);
        return createCorsResponse(
          {
            success: false,
            error: "Failed to delete image",
          },
          500
        );
      }
    }

    // Delete all images for this VIN
    try {
      const prefix = `${vin}/`;
      const listCmd = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
      });

      let deletedCount = 0;
      let truncated = true;

      while (truncated) {
        const res: any = await client.send(listCmd);
        const contents = res.Contents || [];

        for (const obj of contents) {
          if (obj.Key) {
            try {
              await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: obj.Key }));
              deletedCount++;
            } catch (error) {
              console.error(`Error deleting object ${obj.Key}:`, error);
            }
          }
        }

        truncated = res.IsTruncated as boolean;
        if (truncated) listCmd.input.ContinuationToken = res.NextContinuationToken;
      }

      // Delete all database records for this VIN
      await db.delete(images).where(eq(images.carVin, vin));

      console.log(`Successfully deleted ${deletedCount} images for VIN ${vin}`);

      // Revalidate relevant paths after successful bulk deletion
      revalidatePath(`/admin/cars`);
      revalidatePath(`/car/${vin}`);
      revalidatePath(`/admin/edit/${vin}`);

      return createCorsResponse({
        success: true,
        message: `Deleted ${deletedCount} images successfully`,
      });
    } catch (error) {
      console.error(`Error deleting all images for VIN ${vin}:`, error);
      return createCorsResponse(
        {
          success: false,
          error: "Failed to delete images",
        },
        500
      );
    }
  } catch (error) {
    console.error("/api/images/[vin] DELETE error:", error);
    return createCorsResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete images",
      },
      500
    );
  }
}
