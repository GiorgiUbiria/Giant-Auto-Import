"use server";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import "dotenv/config";
import { desc, eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "../drizzle/db";
import {
  images,
  insertImageSchema,
  selectImageSchema,
} from "../drizzle/schema";
import { isAdminProcedure } from "./authProcedures";

const validateEnvironment = () => {
  const required = [
    'CLOUDFLARE_API_ENDPOINT',
    'CLOUDFLARE_ACCESS_KEY_ID',
    'CLOUDFLARE_SECRET_ACCESS_KEY',
    'CLOUDFLARE_BUCKET_NAME'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

const getS3Client = () => {
  validateEnvironment();

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
    requestHandler: {
      requestTimeout: 30000, // Increased timeout for large uploads
    },
    // Connection pooling for better performance
    maxAttempts: 3,
    retryMode: "adaptive",
  });
};

const getBucketName = () => {
  validateEnvironment();
  return process.env.CLOUDFLARE_BUCKET_NAME as string;
};

const SelectImageSchema = selectImageSchema.omit({ id: true }).merge(
  z.object({
    url: z.string(),
  })
);
type SelectImageType = z.infer<typeof SelectImageSchema>;

const Uint8ArraySchema = z
  .array(z.number())
  .transform((arr) => new Uint8Array(arr));

async function getFileCount(prefix: string): Promise<number> {
  try {
    const S3Client = getS3Client();
    const bucketName = getBucketName();

    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
    });

    let fileCount = 0;
    let truncated: boolean = true;

    while (truncated) {
      const response = await S3Client.send(command);
      fileCount += response.Contents?.length ?? 0;
      truncated = response.IsTruncated as boolean;
      if (truncated) {
        command.input.ContinuationToken = response.NextContinuationToken;
      }
    }

    return fileCount;
  } catch (error) {
    console.error("Error getting file count:", error);
    return 0;
  }
}

export const handleUploadImagesAction = isAdminProcedure
  .createServerAction()
  .input(
    z.object({
      vin: z.string(),
      images: z.array(
        z.object({
          buffer: Uint8ArraySchema,
          size: z.number(),
          name: z.string(),
          type: z.enum(["AUCTION", "WAREHOUSE", "DELIVERED", "PICK_UP"]),
        })
      ),
    })
  )
  .handler(async ({ input }) => {
    const { vin, images: imageData } = input;
    const uploadedImages: string[] = [];

    try {
      const S3Client = getS3Client();
      const bucketName = getBucketName();

      console.log(`handleUploadImagesAction: Processing ${imageData.length} images for VIN ${vin}`);

      // Process each image individually for better reliability
      for (const file of imageData) {
        try {
          const prefix = `${vin}/${file.type}/`;
          const existingFileCount = await getFileCount(prefix);
          const key = `${prefix}${existingFileCount + 1}.png`;

          console.log(`handleUploadImagesAction: Uploading ${file.name} (${file.size} bytes) to ${key}`);

          const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: file.buffer,
            ContentLength: file.size,
            ContentType: "image/png",
            // Add metadata for better tracking
            Metadata: {
              'original-name': file.name,
              'upload-timestamp': new Date().toISOString(),
              'file-size': file.size.toString(),
            },
          });

          // Upload with timeout to prevent hanging
          const uploadPromise = S3Client.send(command);
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Upload timeout')), 30000)
          );

          await Promise.race([uploadPromise, timeoutPromise]);

          const insertValues: z.infer<typeof insertImageSchema> = {
            carVin: vin,
            imageType: file.type,
            imageKey: key,
            priority: null,
          };

          // Insert database record immediately
          await db.insert(images).values(insertValues);

          uploadedImages.push(key);
          console.log(`handleUploadImagesAction: Successfully uploaded ${file.name} to ${key}`);
        } catch (error) {
          console.error(`Error uploading image ${file.name} for VIN ${vin}:`, error);
          // Re-throw the error so client can handle retries
          throw error;
        }
      }

      console.log(`handleUploadImagesAction: Completed. Uploaded ${uploadedImages.length}/${imageData.length} images`);
      return uploadedImages;
    } catch (error) {
      console.error("Error in handleUploadImagesAction:", error);
      throw error;
    }
  });

export async function handleImages(
  type: string,
  vin: string,
  sizes: number[]
): Promise<string[]> {
  try {
    const S3Client = getS3Client();
    const bucketName = getBucketName();

    const prefix = `${vin}/${type}/`;
    const existingFileCount = await getFileCount(prefix);

    const keys = sizes.map((_, index) => {
      const newIndex = existingFileCount + index + 1;
      return `${prefix}${newIndex}.png`;
    });

    const urls = await Promise.all(
      keys.map(async (key, index) => {
        const command = new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          ContentLength: sizes[index],
          ContentType: "image/png",
        });

        const signedUrl = await getSignedUrl(S3Client, command, {
          expiresIn: 3600,
        });

        return signedUrl;
      })
    );

    const insertUrls = keys.map((key, index) => ({
      carVin: vin,
      imageType: type as "WAREHOUSE" | "AUCTION" | "DELIVERED" | "PICK_UP",
      imageKey: key,
      imageUrl: urls[index],
    }));

    await db.insert(images).values(insertUrls);

    return urls;
  } catch (error) {
    console.error("Error in handleImages:", error);
    throw error;
  }
}

export async function cleanUpBucket(): Promise<void> {
  try {
    const S3Client = getS3Client();
    const bucketName = getBucketName();

    const listObjectsParams = {
      Bucket: bucketName,
    };

    let continuationToken;

    do {
      const listCommand = new ListObjectsV2Command({
        ...listObjectsParams,
        ContinuationToken: continuationToken,
      });
      const listedObjects: any = await S3Client.send(listCommand);

      if (listedObjects.Contents) {
        for (const item of listedObjects.Contents) {
          if (item.Key) {
            await deleteObjectFromBucket(item.Key);
          }
        }
      }

      continuationToken = listedObjects.NextContinuationToken;
    } while (continuationToken);
  } catch (error) {
    console.error("Error cleaning up the bucket:", error);
  }
}

export async function deleteObjectFromBucket(key: string): Promise<void> {
  try {
    console.log(`deleteObjectFromBucket: Deleting object ${key}`);
    const S3Client = getS3Client();
    const bucketName = getBucketName();

    const deleteParams = {
      Bucket: bucketName,
      Key: key,
    };

    const deleteCommand = new DeleteObjectCommand(deleteParams);

    await S3Client.send(deleteCommand);
    console.log(`deleteObjectFromBucket: Successfully deleted object from bucket: ${key}`);

    await db.delete(images).where(eq(images.imageKey, key));
    console.log(`deleteObjectFromBucket: Successfully deleted image record from database: ${key}`);
  } catch (error) {
    console.error(`deleteObjectFromBucket: Error deleting ${key} from bucket:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}

export async function getSignedUrlForKey(key: string): Promise<string> {
  try {
    const S3Client = getS3Client();
    const bucketName = getBucketName();

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const url = await getSignedUrl(S3Client, command, {
      expiresIn: 3600,
    });

    console.log(`Generated signed URL for key: ${key}`);
    return url;
  } catch (error) {
    console.error(`Error generating signed URL for key ${key}:`, error);
    throw new Error(`Failed to generate signed URL for ${key}`);
  }
}

export async function getPublicUrlForKey(key: string): Promise<string> {
  const publicBaseUrl = process.env.NEXT_PUBLIC_BUCKET_URL;
  if (!publicBaseUrl) {
    throw new Error('NEXT_PUBLIC_BUCKET_URL not configured');
  }

  return `${publicBaseUrl}/${key}`;
}

export async function fetchImageForDisplay(
  vin: string
): Promise<SelectImageType | null> {
  try {
    console.log(`fetchImageForDisplay: Starting fetch for VIN ${vin}`);

    // First try to get the prioritized image (handle both true and non-null values for backward compatibility)
    let imageRecord = await db
      .select()
      .from(images)
      .where(
        and(
          eq(images.carVin, vin),
          eq(images.priority, true)
        )
      )
      .limit(1);

    // If no prioritized image, get the first available image
    if (!imageRecord || imageRecord.length === 0) {
      console.log(`fetchImageForDisplay: No prioritized image found for VIN ${vin}, getting first available`);
      imageRecord = await db
        .select()
        .from(images)
        .where(eq(images.carVin, vin))
        .orderBy(desc(images.id))
        .limit(1);
    }

    if (!imageRecord || imageRecord.length === 0 || !imageRecord[0].imageKey) {
      console.log(`fetchImageForDisplay: No image found for VIN: ${vin}`);
      return null;
    }

    const record = imageRecord[0];
    console.log(`fetchImageForDisplay: Found image record for VIN ${vin}:`, {
      imageKey: record.imageKey,
      imageType: record.imageType,
      priority: record.priority
    });

    let url: string;

    try {
      if (process.env.NEXT_PUBLIC_BUCKET_URL) {
        url = await getPublicUrlForKey(record.imageKey);
        console.log(`fetchImageForDisplay: Using public URL for key: ${record.imageKey}`);
      } else {
        url = await getSignedUrlForKey(record.imageKey);
        console.log(`fetchImageForDisplay: Using presigned URL for key: ${record.imageKey}`);
      }
    } catch (urlError) {
      console.error(`fetchImageForDisplay: Error generating URL for key ${record.imageKey}:`, urlError);
      return null;
    }

    const result = {
      url: url,
      carVin: vin,
      imageKey: record.imageKey,
      imageType: record.imageType,
      priority: record.priority,
    };

    console.log(`fetchImageForDisplay: Successfully prepared result for VIN ${vin}`);
    return result;
  } catch (error) {
    console.error(`fetchImageForDisplay: Error fetching image for VIN ${vin}:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return null;
  }
}

export async function fetchImagesForDisplay(
  vin: string
): Promise<SelectImageType[]> {
  try {
    const imageRecords = await db
      .select()
      .from(images)
      .where(eq(images.carVin, vin))
      .orderBy(desc(images.priority), desc(images.id));

    if (imageRecords.length === 0) {
      console.log(`No images found for VIN: ${vin}`);
      return [];
    }

    const imageData = await Promise.all(
      imageRecords.map(async (record) => {
        if (!record.imageKey) {
          console.error(`Image record missing imageKey for VIN: ${vin}`);
          return null;
        }

        try {
          let url: string;
          if (process.env.NEXT_PUBLIC_BUCKET_URL) {
            url = await getPublicUrlForKey(record.imageKey);
          } else {
            url = await getSignedUrlForKey(record.imageKey);
          }
          
          return {
            url: url,
            carVin: vin,
            imageKey: record.imageKey,
            imageType: record.imageType,
            priority: record.priority,
          };
        } catch (error) {
          console.error(`Failed to generate URL for image key ${record.imageKey}:`, error);
          return null;
        }
      })
    );

    // Filter out any null results
    return imageData.filter((item): item is SelectImageType => item !== null);
  } catch (error) {
    console.error(`Error fetching images for VIN ${vin}:`, error);
    return [];
  }
}

export async function cleanUpBucketForVin(vin: string): Promise<void> {
  try {
    console.log(`cleanUpBucketForVin: Starting cleanup for VIN ${vin}`);
    const S3Client = getS3Client();
    const bucketName = getBucketName();

    const listObjectsParams = {
      Bucket: bucketName,
      Prefix: `${vin}/`,
    };

    let continuationToken;
    let totalDeleted = 0;

    do {
      const listCommand = new ListObjectsV2Command({
        ...listObjectsParams,
        ContinuationToken: continuationToken,
      });
      const listedObjects: any = await S3Client.send(listCommand);

      if (listedObjects.Contents && listedObjects.Contents.length > 0) {
        console.log(`cleanUpBucketForVin: Found ${listedObjects.Contents.length} objects to delete for VIN ${vin}`);

        for (const item of listedObjects.Contents) {
          if (item.Key) {
            console.log(`cleanUpBucketForVin: Deleting object ${item.Key}`);
            await deleteObjectFromBucket(item.Key);
            totalDeleted++;
          }
        }
      } else {
        console.log(`cleanUpBucketForVin: No objects found for VIN ${vin}`);
      }

      continuationToken = listedObjects.NextContinuationToken;
    } while (continuationToken);

    console.log(`cleanUpBucketForVin: Cleanup completed for VIN ${vin}. Total objects deleted: ${totalDeleted}`);
  } catch (error) {
    console.error(`cleanUpBucketForVin: Error cleaning up the bucket for VIN ${vin}:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
}

export async function testR2Connection(): Promise<boolean> {
  try {
    const S3Client = getS3Client();
    const bucketName = getBucketName();

    console.log('Testing R2 connection with configuration:');
    console.log('Endpoint:', process.env.CLOUDFLARE_API_ENDPOINT);
    console.log('Bucket:', bucketName);

    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      MaxKeys: 1,
    });

    const result = await S3Client.send(command);
    console.log('R2 connection successful. Found objects:', result.KeyCount || 0);
    return true;
  } catch (error) {
    console.error('R2 connection failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n')[0], // First line of stack trace
      });
    }
    return false;
  }
}
