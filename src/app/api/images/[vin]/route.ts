import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle/db";
import { images } from "@/lib/drizzle/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import {
  getPublicUrlForKey,
  getSignedUrlForKey,
} from "@/lib/actions/bucketActions";
import {
  S3,
  ListObjectsV2Command,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { vin: string } }
) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    const vin = params.vin;
    const type = searchParams.get("type") || undefined;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const pageSizeParam = parseInt(searchParams.get("pageSize") || "12", 10);
    const pageSize = Number.isNaN(pageSizeParam) ? 12 : pageSizeParam;
    const mode = searchParams.get("mode");

    const isSingleMode = mode === "single";

    if (isSingleMode) {
      // Return a single prioritized image (thumbnail even-index URL)
      // 1) get prioritized image; fallback to latest
      let record = await db
        .select()
        .from(images)
        .where(and(eq(images.carVin, vin), eq(images.priority, true)) as any)
        .limit(1);

      if (!record || record.length === 0) {
        record = await db
          .select()
          .from(images)
          .where(eq(images.carVin, vin) as any)
          .orderBy(desc(images.id))
          .limit(1);
      }

      if (!record || record.length === 0) {
        return NextResponse.json({ data: null });
      }

      const selected = record[0];
      const key = selected.imageKey!;
      // compute even neighbor
      const match = key.match(/^(.*\/)\s*(\d+)\.png$/);
      let preferredKey = key;
      if (match) {
        const base = match[1];
        const n = parseInt(match[2], 10);
        const even = n % 2 === 0 ? n : n + 1;
        const evenKey = `${base}${even}.png`;
        // prefer even if exists, else fallback
        const exists = await db
          .select({ k: images.imageKey })
          .from(images)
          .where(eq(images.imageKey, evenKey))
          .limit(1);
        preferredKey = exists.length > 0 ? evenKey : key;
      }

      const usePublic = !!process.env.NEXT_PUBLIC_BUCKET_URL;
      const imageUrl = usePublic
        ? await getPublicUrlForKey(preferredKey)
        : await getSignedUrlForKey(preferredKey);

      return NextResponse.json({
        data: {
          url: imageUrl,
          carVin: vin,
          imageKey: preferredKey,
          imageType: selected.imageType,
          priority: selected.priority ?? false,
        },
      });
    }

    const whereClause = type
      ? and(eq(images.carVin, vin), eq(images.imageType, type as any))
      : eq(images.carVin, vin);

    // Fetch all, filter odd-numbered originals, apply pagination in memory
    let allRecords = await db
      .select()
      .from(images)
      .where(whereClause as any)
      .orderBy(desc(images.priority), desc(images.id));

    // Keep only odd-numbered originals based on numeric filename
    const oddRecords = allRecords.filter((rec) => {
      const key = rec.imageKey || "";
      const m = key.match(/^(.*\/)\s*(\d+)\.png$/);
      if (!m) return true; // if not numeric, keep
      const n = parseInt(m[2], 10);
      return n % 2 === 1;
    });

    const count = oddRecords.length;
    const effectivePageSize = pageSize === 0 ? Math.max(1, count) : pageSize;
    const totalPages =
      pageSize === 0 ? 1 : Math.max(1, Math.ceil(count / effectivePageSize));
    const currentPage = pageSize === 0 ? 1 : Math.min(page, totalPages);
    const start = pageSize === 0 ? 0 : (currentPage - 1) * effectivePageSize;
    const end = pageSize === 0 ? count : start + effectivePageSize;
    const records = oddRecords.slice(start, end);

    const usePublic = !!process.env.NEXT_PUBLIC_BUCKET_URL;
    const items = await Promise.all(
      records.map(async (rec) => {
        const url = usePublic
          ? await getPublicUrlForKey(rec.imageKey!)
          : await getSignedUrlForKey(rec.imageKey!);
        return {
          id: rec.id,
          imageKey: rec.imageKey!,
          imageType: rec.imageType as
            | "AUCTION"
            | "WAREHOUSE"
            | "DELIVERED"
            | "PICK_UP",
          carVin: rec.carVin!,
          priority: rec.priority ?? false,
          url,
        };
      })
    );

    const response = NextResponse.json({
      images: items,
      count,
      totalPages,
      currentPage,
    });

    // Add cache headers
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=300"
    );
    response.headers.set("CDN-Cache-Control", "public, s-maxage=60");
    response.headers.set("Vercel-CDN-Cache-Control", "public, s-maxage=60");
    return response;
  } catch (error) {
    console.error("/api/images/[vin] GET error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch images",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

function getS3Client() {
  const endpoint = process.env.CLOUDFLARE_API_ENDPOINT as string;
  const accessKeyId = process.env.CLOUDFLARE_ACCESS_KEY_ID as string;
  const secretAccessKey = process.env.CLOUDFLARE_SECRET_ACCESS_KEY as string;
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("Missing Cloudflare R2 environment configuration");
  }
  return new S3({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
    maxAttempts: 3,
    retryMode: "adaptive",
  });
}

function getBucketName() {
  const bucket = process.env.CLOUDFLARE_BUCKET_NAME as string;
  if (!bucket) throw new Error("CLOUDFLARE_BUCKET_NAME not set");
  return bucket;
}

async function getNextIndexForPrefix(
  client: S3,
  bucket: string,
  prefix: string
) {
  const command = new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix });
  let maxIndex = 0;
  let truncated = true;
  while (truncated) {
    const res: any = await client.send(command);
    const contents = res.Contents || [];
    for (const obj of contents) {
      if (obj.Key && obj.Key.startsWith(prefix)) {
        const name = obj.Key.slice(prefix.length);
        const [numStr] = name.split(".");
        const n = parseInt(numStr, 10);
        if (!Number.isNaN(n)) maxIndex = Math.max(maxIndex, n);
      }
    }
    truncated = res.IsTruncated as boolean;
    if (truncated) command.input.ContinuationToken = res.NextContinuationToken;
  }
  return maxIndex + 1;
}

export async function POST(
  request: Request,
  { params }: { params: { vin: string } }
) {
  try {
    const vin = params.vin;
    const body = await request.json();
    const imagesPayload: Array<{
      buffer: number[];
      size: number;
      name: string;
      type: "AUCTION" | "WAREHOUSE" | "DELIVERED" | "PICK_UP";
    }> = body?.images || [];
    if (!vin || !Array.isArray(imagesPayload) || imagesPayload.length === 0) {
      return NextResponse.json(
        { error: "No images provided" },
        { status: 400 }
      );
    }

    const client = getS3Client();
    const bucket = getBucketName();

    // Pre-compute next odd-aligned index per type to guarantee originals are odd and thumbnails even
    const nextIndexByType = new Map<string, number>();
    const getNextOddIndex = async (prefix: string): Promise<number> => {
      const cmd = new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix });
      let count = 0;
      let truncated = true;
      while (truncated) {
        const res: any = await client.send(cmd);
        count += res.Contents?.length || 0;
        truncated = res.IsTruncated as boolean;
        if (truncated) cmd.input.ContinuationToken = res.NextContinuationToken;
      }
      // Align to next odd index (1-based)
      if (count % 2 === 0) return count + 1; // 0->1,2->3,4->5
      return count + 2; // 1->3,3->5
    };

    const uploaded: string[] = [];
    for (const file of imagesPayload) {
      const prefix = `${vin}/${file.type}/`;
      if (!nextIndexByType.has(file.type)) {
        const nextOdd = await getNextOddIndex(prefix);
        nextIndexByType.set(file.type, nextOdd);
      }
      const currentIndex = nextIndexByType.get(file.type)!;
      const key = `${prefix}${currentIndex}.png`;

      const put = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: new Uint8Array(file.buffer),
        ContentLength: file.size,
        ContentType: "image/png",
        Metadata: {
          "original-name": file.name,
          "upload-timestamp": new Date().toISOString(),
        },
      });
      await client.send(put);

      await db.insert(images).values({
        carVin: vin,
        imageType: file.type,
        imageKey: key,
        priority: false,
      });
      uploaded.push(key);

      // Increment for the next file of the same type
      nextIndexByType.set(file.type, currentIndex + 1);
    }

    return NextResponse.json({ success: true, uploaded });
  } catch (error) {
    console.error("/api/images/[vin] POST error:", error);
    return NextResponse.json(
      { error: "Failed to upload images" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { vin: string } }
) {
  try {
    const vin = params.vin;
    const { action, imageKey } = await request.json();
    if (action !== "makeMain" || !imageKey) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    await db
      .update(images)
      .set({ priority: false })
      .where(eq(images.carVin, vin));
    await db
      .update(images)
      .set({ priority: true })
      .where(eq(images.imageKey, imageKey));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("/api/images/[vin] PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update image" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { vin: string } }
) {
  try {
    const vin = params.vin;
    const url = new URL(request.url);
    const imageKey = url.searchParams.get("imageKey");

    const client = getS3Client();
    const bucket = getBucketName();

    if (imageKey) {
      await client.send(
        new DeleteObjectCommand({ Bucket: bucket, Key: imageKey })
      );
      await db.delete(images).where(eq(images.imageKey, imageKey));
      return NextResponse.json({ success: true });
    }

    const prefix = `${vin}/`;
    const listCmd = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
    });
    let truncated = true;
    while (truncated) {
      const res: any = await client.send(listCmd);
      const contents = res.Contents || [];
      for (const obj of contents) {
        if (obj.Key) {
          await client.send(
            new DeleteObjectCommand({ Bucket: bucket, Key: obj.Key })
          );
        }
      }
      truncated = res.IsTruncated as boolean;
      if (truncated)
        listCmd.input.ContinuationToken = res.NextContinuationToken;
    }
    await db.delete(images).where(eq(images.carVin, vin));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("/api/images/[vin] DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete images" },
      { status: 500 }
    );
  }
}
