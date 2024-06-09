"use server";

import {
  S3,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import "dotenv/config";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ActionResult } from "next/dist/server/app-render/types";
import { Image } from "../interfaces";

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

export async function handleUploadImage(
  type: string,
  vin: string,
  size: number,
): Promise<ActionResult | undefined> {
  const fileName = `${vin}/${type}/1.png`;

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

  console.log(url);

  return url;
}

export async function handleUploadImages(
  type: string,
  vin: string,
  sizes: number[],
): Promise<string[]> {
  const urls = await Promise.all(
    sizes.map(async (size, index) => {
      const fileName = `${vin}/${type}/${index + 1}.png`;

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

  return urls;
}

export async function getImageFromBucket() {
  const imageUrl = "Screenshot from 2024-05-28 22-22-27.png";

  console.log(
    await getSignedUrl(
      S3Client,
      new GetObjectCommand({ Bucket: bucketName, Key: imageUrl }),
      { expiresIn: 3600 },
    ),
  );
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
    })
  );

  return imageData.filter((item): item is Image => item !== undefined);
}