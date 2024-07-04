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

  const urls = await Promise.all(
    sizes.map(async (size, index) => {
      const newIndex = existingFileCount + index + 1;
      const fileName = `${prefix}${newIndex}.png`;

      const url = await getSignedUrl(
        S3Client,
        new PutObjectCommand({
          Bucket: bucketName,
          Key: fileName,
          ContentLength: size,
          ContentType: "image/png",
        }),
        { expiresIn: 3600 },
      );

      return url;
    }),
  );

  revalidatePath("/admin/edit");

  return urls;
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
        const getObjectParams = {
          Bucket: bucketName,
          Key: item.Key,
        };

        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(S3Client, command, { expiresIn: 3600 });

        const typeMatch = item.Key.match(/\/(Arrival|Container)\//);
        const imageType = typeMatch
          ? (typeMatch[1] as "Arrival" | "Container")
          : "Container";

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
