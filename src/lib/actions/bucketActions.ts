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

const endpoint = process.env.CLOUDFLARE_API_ENDPOINT as string;
const accessKeyId = process.env.CLOUDFLARE_ACCESS_KEY_ID as string;
const secretAccessKey = process.env.CLOUDFLARE_SECRET_ACCESS_KEY as string;
const bucketName = process.env.CLOUDFLARE_BUCKET_NAME as string;

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
          ContentLength: file.size,
          ContentType: "image/png",
        });

        const signedUrl = await getSignedUrl(S3Client, command, {
          expiresIn: 3600,
        });

        const insertValues: z.infer<typeof insertImageSchema> = {
          carVin: vin,
          imageType: file.type,
          imageKey: key,
          priority: null,
        };

        await db.insert(images).values(insertValues);

        await fetch(signedUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "image/png",
          },
          body: file.buffer,
        });

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
  return getSignedUrl(
    S3Client,
    new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
    { expiresIn: 3600 }
  );
}

export async function fetchImagesForDisplay(
  vin: string
): Promise<SelectImageType[]> {
  const imageRecords = await db
    .select()
    .from(images)
    .where(eq(images.carVin, vin))
    .orderBy(desc(images.priority));

  const imageData = await Promise.all(
    imageRecords.map(async (record) => {
      const url = await getSignedUrlForKey(record.imageKey!);
      return {
        url: url,
        carVin: vin,
        imageKey: record.imageKey,
        imageType: record.imageType,
        priority: record.priority,
      };
    })
  );

  return imageData;
}

export async function fetchImageForDisplay(
  vin: string
): Promise<SelectImageType | null> {
  const [imageRecord] = await db
    .select()
    .from(images)
    .where(eq(images.carVin, vin))
    .orderBy(desc(images.priority))
    .limit(1);

  if (!imageRecord) return null;

  const url = await getSignedUrlForKey(imageRecord.imageKey!);

  const result = {
    url: url,
    carVin: vin,
    imageKey: imageRecord.imageKey,
    imageType: imageRecord.imageType,
    priority: imageRecord.priority,
  };

  return result;
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
