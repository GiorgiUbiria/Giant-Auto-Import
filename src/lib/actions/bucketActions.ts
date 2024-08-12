"use server";

import {
  S3,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import "dotenv/config";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { db } from "../drizzle/db";
import { cars, images, insertImageSchema, selectImageSchema } from "../drizzle/schema";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { SQLiteTransaction } from "drizzle-orm/sqlite-core";

const endpoint = process.env.CLOUDFLARE_API_ENDPOINT as string;
const accessKeyId = process.env.CLOUDFLARE_ACCESS_KEY_ID as string;
const secretAccessKey = process.env.CLOUDFLARE_SECRET_ACCESS_KEY as string;
const bucketName = process.env.CLOUDFLARE_BUCKET_NAME as string;

const S3Client = new S3({
  region: "auto",
  endpoint: endpoint,
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
});

async function getFileCount(prefix: string): Promise<number> {
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
}

export async function handleUploadImages(
  vin: string,
  fileData: { type: "WAREHOUSE" | "PICK_UP" | "DELIVERED" | "AUCTION", buffer: Uint8Array, size: number, name: string }[],
  tx: SQLiteTransaction<"async", any, any, any>
) {
  const promises = fileData.map(async (file) => {
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
    }

    await tx.insert(images).values(insertValues);

    return signedUrl;
  });

  const urls = await Promise.all(promises);

  await Promise.all(
    urls.map((url: string, index: number) =>
      fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "image/png",
        },
        body: fileData[index].buffer,
      }),
    ),
  );
}

export async function cleanUpBucketTwo(): Promise<void> {
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

export async function cleanUpBucket(): Promise<void> {
  try {
    const currentCars = await db.select().from(cars);
    const currentVins = new Set(currentCars.map((car) => car.vin));

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
            const keyVinMatch = item.Key.match(/^(.*?\/)/);
            const keyVin = keyVinMatch ? keyVinMatch[1].slice(0, -1) : null;

            if (keyVin && !currentVins.has(keyVin)) {
              await deleteObjectFromBucket(item.Key);
            }
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

async function getSignedUrlForKey(key: string): Promise<string> {
  return getSignedUrl(
    S3Client,
    new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
    { expiresIn: 3600 },
  );
}

export async function fetchImagesForDisplay(vin: string): Promise<z.infer<typeof selectImageSchema>> {
  const imageRecords = await db
    .select()
    .from(images)
    .where(eq(images.carVin, vin))
    .orderBy(desc(images.priority));

  const imageData = await Promise.all(
    imageRecords.map(async (record) => {
      const url = await getSignedUrlForKey(record.imageKey!);
      return {
        carVin: vin,
        imageKey: record.imageKey,
        imageType: record.imageType,
        priority: record.priority,
      };
    }),
  );

  return imageData;
}
