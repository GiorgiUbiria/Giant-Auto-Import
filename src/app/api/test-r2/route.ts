import { NextResponse } from "next/server";
import { S3 } from "@aws-sdk/client-s3";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import "dotenv/config";

export async function GET() {
  try {
    console.log("Testing R2 connection...");
    
    // Check environment variables
    const required = [
      'CLOUDFLARE_API_ENDPOINT',
      'CLOUDFLARE_ACCESS_KEY_ID',
      'CLOUDFLARE_SECRET_ACCESS_KEY',
      'CLOUDFLARE_BUCKET_NAME'
    ];

    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
      return NextResponse.json({
        error: "Missing environment variables",
        missing,
        available: Object.keys(process.env).filter(key => key.startsWith('CLOUDFLARE_'))
      }, { status: 500 });
    }

    // Create S3 client
    const s3Client = new S3({
      region: "auto",
      endpoint: process.env.CLOUDFLARE_API_ENDPOINT,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
        secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
      },
      forcePathStyle: true,
    });

    // Test connection by listing objects
    const command = new ListObjectsV2Command({
      Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
      MaxKeys: 1,
    });

    const result = await s3Client.send(command);
    
    return NextResponse.json({
      success: true,
      message: "R2 connection successful",
      bucket: process.env.CLOUDFLARE_BUCKET_NAME,
      endpoint: process.env.CLOUDFLARE_API_ENDPOINT,
      objectsFound: result.KeyCount || 0,
      sampleKeys: result.Contents?.slice(0, 3).map(obj => obj.Key) || []
    });

  } catch (error) {
    console.error("R2 test failed:", error);
    return NextResponse.json({
      error: "R2 connection failed",
      details: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
} 