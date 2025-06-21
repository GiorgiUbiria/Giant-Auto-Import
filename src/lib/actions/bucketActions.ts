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
import { desc, eq } from "drizzle-orm";
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

validateEnvironment();

const endpoint = process.env.CLOUDFLARE_API_ENDPOINT as string;
const accessKeyId = process.env.CLOUDFLARE_ACCESS_KEY_ID as string;
const secretAccessKey = process.env.CLOUDFLARE_SECRET_ACCESS_KEY as string;
const bucketName = process.env.CLOUDFLARE_BUCKET_NAME as string;

console.log('R2 Configuration:', {
  endpoint: endpoint ? 'SET' : 'MISSING',
  accessKeyId: accessKeyId ? 'SET' : 'MISSING', 
  secretAccessKey: secretAccessKey ? 'SET' : 'MISSING',
  bucketName: bucketName ? 'SET' : 'MISSING'
});

const SelectImageSchema = selectImageSchema.omit({ id: true }).merge(
  z.object({
    url: z.string(),
  })
);
type SelectImageType = z.infer<typeof SelectImageSchema>;

const Uint8ArraySchema = z
  .array(z.number())
  .transform((arr) => new Uint8Array(arr));

const S3Client = new S3({
  region: "auto",
  endpoint: endpoint,
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
  forcePathStyle: true,
  requestHandler: {
    requestTimeout: 10000,
  },
});

async function getFileCount(prefix: string): Promise<number> {
  try {
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

    for (const file of imageData) {
      try {
        const prefix = `${vin}/${file.type}/`;
        const existingFileCount = await getFileCount(prefix);

        const key = `${prefix}${existingFileCount + 1}.png`;

        const command = new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: file.buffer,
          ContentLength: file.size,
          ContentType: "image/png",
        });

        // Upload directly using S3 SDK instead of signed URL
        await S3Client.send(command);

        const insertValues: z.infer<typeof insertImageSchema> = {
          carVin: vin,
          imageType: file.type,
          imageKey: key,
          priority: null,
        };

        await db.insert(images).values(insertValues);

        uploadedImages.push(key);
      } catch (error) {
        console.error(`Error uploading image for VIN ${vin}:`, error);
      }
    }

    return uploadedImages;
  });

export async function handleImages(
  type: string,
  vin: string,
  sizes: number[]
): Promise<string[]> {
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
}

export async function cleanUpBucket(): Promise<void> {
  try {
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
  const deleteParams = {
    Bucket: bucketName,
    Key: key,
  };

  const deleteCommand = new DeleteObjectCommand(deleteParams);

  try {
    await S3Client.send(deleteCommand);

    await db.delete(images).where(eq(images.imageKey, key));
  } catch (error) {
    console.error(`Error deleting ${key} from ${bucketName}:`, error);
  }
}

export async function getSignedUrlForKey(key: string): Promise<string> {
  try {
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
    
    const [imageRecord] = await db
      .select()
      .from(images)
      .where(eq(images.carVin, vin))
      .orderBy(desc(images.priority))
      .limit(1);

    if (!imageRecord || !imageRecord.imageKey) {
      console.log(`fetchImageForDisplay: No image found for VIN: ${vin}`);
      return null;
    }

    console.log(`fetchImageForDisplay: Found image record for VIN ${vin}:`, {
      imageKey: imageRecord.imageKey,
      imageType: imageRecord.imageType
    });

    let url: string;
    
    if (process.env.NEXT_PUBLIC_BUCKET_URL) {
      url = await getPublicUrlForKey(imageRecord.imageKey);
      console.log(`fetchImageForDisplay: Using public URL for key: ${imageRecord.imageKey}`);
    } else {
      url = await getSignedUrlForKey(imageRecord.imageKey);
      console.log(`fetchImageForDisplay: Using presigned URL for key: ${imageRecord.imageKey}`);
    }

    const result = {
      url: url,
      carVin: vin,
      imageKey: imageRecord.imageKey,
      imageType: imageRecord.imageType,
      priority: imageRecord.priority,
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
      .orderBy(desc(images.priority));

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
          const url = await getSignedUrlForKey(record.imageKey);
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
    const listObjectsParams = {
      Bucket: bucketName,
      Prefix: `${vin}/`,
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
    console.error(`Error cleaning up the bucket for VIN ${vin}:`, error);
  }
}

export async function testR2Connection(): Promise<boolean> {
  try {
    console.log('Testing R2 connection with configuration:');
    console.log('Endpoint:', endpoint);
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
