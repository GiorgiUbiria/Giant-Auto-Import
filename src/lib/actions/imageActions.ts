"use server";

import sharp from "sharp";
import { db } from "../drizzle/db";
import { images } from "../drizzle/schema";
import { ActionResult } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { deleteObjectFromBucket } from "./bucketActions";

export async function deleteImage(imageKey: string): Promise<ActionResult> {
  try {
    await deleteObjectFromBucket(imageKey);
    await db.delete(images).where(eq(images.imageKey, imageKey));

    revalidatePath("/admin/edit");

    return { 
      success: true, 
      message: "Image deleted successfully"
    };
  } catch (error) {
    console.error("Error deleting image:", error);
    return { 
      success: false,
      error: "Error deleting image",
    };
  }
}

export async function makeMain(key: string, vin: string) {
  console.log("Making main", key, vin)
  try {
    const isMain = await db
      .select({
        imageKey: images.imageKey
      })
      .from(images)
      .where(eq(images.priority, true))

    if (isMain.length === 0) {
      await db
        .update(images)
        .set({
          priority: true,
        })
        .where(eq(images.imageKey, key))
    } else {
      await db
        .transaction(async (tx) => {
          await tx.update(images).set({ priority: null }).where(eq(images.imageKey, isMain[0].imageKey!));
          await tx.update(images).set({ priority: true }).where(eq(images.imageKey, key));
        })
    }

  } catch (error) {
    console.error(error)
  } finally {
    revalidatePath("/admin/edit")
    revalidatePath("/car/" + vin)
  }
}
