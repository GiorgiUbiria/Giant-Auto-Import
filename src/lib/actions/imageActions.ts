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

export async function makeMain(key: string, vin: string) {
  console.log("Making main", key, vin)
  try {
    const isMain = await db
      .select({
        imageKey: imageTable.imageKey
      })
      .from(imageTable)
      .where(eq(imageTable.priority, true))

    if (isMain.length === 0) {
      await db
        .update(imageTable)
        .set({
          priority: true,
        })
        .where(eq(imageTable.imageKey, key))
    } else {
      await db
        .transaction(async (tx) => {
          await tx.update(imageTable).set({ priority: null }).where(eq(imageTable.imageKey, isMain[0].imageKey!));
          await tx.update(imageTable).set({ priority: true }).where(eq(imageTable.imageKey, key));
        })
    }

  } catch (error) {
    console.error(error)
  } finally {
    revalidatePath("/admin/edit")
    revalidatePath("/car/" + vin)
  }
}
