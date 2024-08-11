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
import { revalidatePath } from "next/cache";
import { db } from "../drizzle/db";
import { cars, images, insertImageSchema, selectImageSchema } from "../drizzle/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";


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



export async function handleUploadImages(
  type: "WAREHOUSE" | "PICK_UP" | "DELIVERED" | "AUCTION",
  vin: string,
  sizes: number[],
): Promise<string[]> {
  const prefix = `${vin}/${type}/`;
  const existingFileCount = await getFileCount(prefix);

  const keys = sizes.map((_size, index) => {
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
    }),
  );

  const insertUrls: z.infer<typeof insertImageSchema>[] = keys.map((key) => ({
    carVin: vin,
    imageType: type,
    imageKey: key,
  }));

  await db.insert(images).values(insertUrls);

  revalidatePath("/admin/edit");

  return urls;
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

// export async function fetchImageForDisplay(vins: string[]): Promise<Record<string, Image>> {
//   const imageRecords = await db
//     .select()
//     .from(images)
//     .where(inArray(images.carVin, vins))
//     .groupBy(images.carVin)
//     .orderBy(desc(images.priority));
//
//   const imageUrls = await Promise.all(imageRecords.map(async (imageRecord) => {
//     const url = await getSignedUrlForKey(imageRecord.imageKey!);
//     return {
//       vin: imageRecord.carVin,
//       image: {
//         imageUrl: url,
//         imageType: imageRecord.imageType,
//         imageKey: imageRecord.imageKey,
//         priority: imageRecord.priority,
//       } as Image,
//     };
//   }));
//
//   const images: Record<string, Image> = {};
//   imageUrls.forEach(({ vin, image }) => {
//     images[vin!] = image;
//   });
//
//   return images;
// }

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

  //TODO: Reconstruct image fetching logic

  return imageData;
}
