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
import { Image } from "../interfaces";
import { revalidatePath } from "next/cache";
import { DbImage } from "./dbActions";
import { db } from "../drizzle/db";
import { carTable, imageTable } from "../drizzle/schema";
import { eq } from "drizzle-orm";

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

export async function deleteImageFromBucket(imageUrl: string): Promise<void> {
  const url = new URL(imageUrl);
  const key = decodeURIComponent(url.pathname.substring(1));

  const deleteParams = {
    Bucket: bucketName,
    Key: key,
  };

  const deleteCommand = new DeleteObjectCommand(deleteParams);

  try {
    await S3Client.send(deleteCommand);
    console.log(`Successfully deleted ${key} from ${bucketName}`);
  } catch (error) {
    console.error(`Error deleting ${key} from ${bucketName}:`, error);
  }
}

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
  type: string,
  vin: string,
  sizes: number[],
): Promise<string[]> {
  const prefix = `${vin}/${type}/`;
  const existingFileCount = await getFileCount(prefix);

  const keys = sizes.map((size, index) => {
    const newIndex = existingFileCount + index + 1;
    return `${prefix}${newIndex}.png`;
  });

  await Promise.all(
    keys.map((key, index) =>
      S3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          ContentLength: sizes[index],
          ContentType: "image/png",
        }),
      ),
    ),
  );

  const insertUrls = keys.map((key) => ({
    carVin: vin,
    imageType: type as DbImage,
    imageKey: key,
  }));

  await db.insert(imageTable).values(insertUrls);

  revalidatePath("/admin/edit");

  return keys;
}

export async function getImagesFromBucket(vin: string): Promise<Image[]> {
  const prefix = `${vin}/`;

  const listObjectsParams = {
    Bucket: bucketName,
    Prefix: prefix,
  };

  const listCommand = new ListObjectsV2Command(listObjectsParams);
  const listedObjects = await S3Client.send(listCommand);

  if (!listedObjects.Contents) {
    console.log("No images found in the specified directory");
    return [];
  }

  const imageData = await Promise.all(
    listedObjects.Contents.map(async (item) => {
      if (item.Key) {
        const url = await getSignedUrl(
          S3Client,
          new GetObjectCommand({
            Bucket: bucketName,
            Key: item.Key,
          }),
          { expiresIn: 3600 },
        );

        const typeMatch = item.Key.match(
          /\/(AUCTION|PICK_UP|WAREHOUSE|DELIVERY)\//,
        );
        const imageType = typeMatch ? (typeMatch[1] as DbImage) : "AUCTION";

        return {
          imageUrl: url,
          imageType,
        } as Image;
      }
      return undefined;
    }),
  );

  return imageData.filter((item): item is Image => item !== undefined);
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

export async function fetchImagesForDisplay(vin: string): Promise<Image[]> {
  const imageRecords = await db
    .select()
    .from(imageTable)
    .where(eq(imageTable.carVin, vin));

  const images = await Promise.all(
    imageRecords.map(async (record) => {
      const url = await getSignedUrlForKey(record.imageKey!);
      return {
        imageUrl: url,
        imageType: record.imageType,
      };
    }),
  );

  return images;
}

async function saveImageUrlToDb(
  carVin: string,
  imageUrl: string,
  imageType: DbImage,
) {
  await db.insert(imageTable).values({
    carVin: carVin,
    imageUrl: imageUrl,
    imageType: imageType,
  });
}

export async function syncCarImagesWithDatabase() {
  try {
    const cars = await db.select().from(carTable);

    for (const car of cars) {
      const prefix = `${car.vin}/`;

      const listObjectsParams = {
        Bucket: bucketName,
        Prefix: prefix,
      };
      const listedObjects = await S3Client.send(
        new ListObjectsV2Command(listObjectsParams),
      );

      for (const item of listedObjects.Contents || []) {
        const imageTypeMatch = item.Key?.match(
          /\/(AUCTION|PICK_UP|WAREHOUSE|DELIVERY)\//,
        );
        const imageType = imageTypeMatch ? (imageTypeMatch[1] as DbImage) : "AUCTION";

        await db.insert(imageTable).values({
          carVin: car.vin!,
          imageKey: item.Key!,  // Store the key instead of the signed URL
          imageType: imageType,
        });
      }
    }

    console.log("Image keys have been successfully synced with the database.");
  } catch (error) {
    console.error("Error syncing car images with the database:", error);
  }
}
