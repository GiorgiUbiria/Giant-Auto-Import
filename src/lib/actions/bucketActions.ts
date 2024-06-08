import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID!}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
  },
});

export async function handleUploadImage(type: string, vin: string, formData: FormData): Promise<string> {
  const file = formData.get("image") as File;
  const fileExtension = file.name.split(".").pop();
  const fileName = `${vin}-${type}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_BUCKET_NAME!,
    Key: fileName,
    Body: file,
    ContentType: file.type,
  });

  const url = await getSignedUrl(s3Client, command)

  return url;
}
