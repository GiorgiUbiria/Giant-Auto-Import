"use server";

import sharp from "sharp";
import { db } from "../drizzle/db";
import { imageTable } from "../drizzle/schema";
import { ActionResult } from "../form";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { deleteObjectFromBucket } from "./bucketActions";

export async function deleteImage(imageUrl: string): Promise<ActionResult> {
  try {
    const isFromCloudFlare = imageUrl.includes("cloudflare");

    if (isFromCloudFlare) {
      const url = new URL(imageUrl);
      const key = decodeURIComponent(url.pathname.substring(1));

      await deleteObjectFromBucket(key);
    } else {
      await db.delete(imageTable).where(eq(imageTable.imageUrl, imageUrl));
    }

    revalidatePath("/admin/edit");

    return { success: "Image deleted successfully", error: null };
  } catch (error) {
    console.error("Error deleting image:", error);
    return { error: "Error deleting image" };
  }
}

export async function convertToWebp(
  buff: ArrayBuffer,
  name: string,
): Promise<File> {
  const webp = await sharp(buff).webp().toBuffer();
  return new File([webp], name, { type: "image/webp" });
}
