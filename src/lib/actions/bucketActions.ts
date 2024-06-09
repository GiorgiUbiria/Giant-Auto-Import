"use server";

import {
  S3,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import "dotenv/config";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ActionResult } from "next/dist/server/app-render/types";

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
    new PutObjectCommand({ Bucket: bucketName, Key: fileName, ContentLength: size, ContentType: "image/png" }),
    { expiresIn: 3600 }, 
  );

  console.log(url)

  return url;
}

// export async function getImageFromBucket() {
//   const imageUrl = "Screenshot from 2024-05-28 22-22-27.png";
//
//   console.log(
//     await getSignedUrl(
//       S3,
//       new GetObjectCommand({ Bucket: bucketName, Key: imageUrl }),
//       { expiresIn: 3600 },
//     ),
//   );
// }
