"use server";

import { APIAssets } from "@/lib/interfaces";
import sharp from "sharp";
import { ensureToken } from "./tokenActions";
import { APICarResponse } from "../api-interfaces";
import { fetchCars } from "./actions";
import { db } from "../drizzle/db";
import { imageTable } from "../drizzle/schema";
import { ActionResult } from "../form";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { deleteObjectFromBucket } from "./bucketActions";

type NewImage = typeof imageTable.$inferInsert;

const insertImage = async (vin: string, imageUrl: string) => {
  const image: NewImage = {
    carVin: vin,
    imageUrl: imageUrl,
    imageType: "AUCTION",
  };

  try {
    await db.insert(imageTable).values(image);
    console.log(`Image inserted for VIN: ${vin}`);
  } catch (error) {
    console.error(`Error inserting image for VIN: ${vin}`, error);
  }
};

export async function updateLocalDatabaseImages(): Promise<void> {
  try {
    const cars: APICarResponse | undefined = await fetchCars();

    if (!cars) {
      console.log("No cars fetched.");
      return;
    }

    for (const data of cars.data) {
      const { specifications } = data;

      if (specifications?.vin) {
        const vin = specifications.vin;
        const assets: APIAssets[] | undefined = await fetchAssets(vin);

        console.log(assets);

        if (assets && Array.isArray(assets)) {
          const images = assets.filter(
            (asset: APIAssets) => asset.type.toLowerCase() === "image",
          );
          if (images.length > 0) {
            for (const image of images) {
              const imageUrl = image.value;
              const imageExists = await db
                .select()
                .from(imageTable)
                .where(eq(imageTable.imageUrl, imageUrl));
              if (!imageExists) {
                await insertImage(vin, imageUrl);
              } else {
                continue;
              }
            }
          } else {
            console.log(`No image assets found for VIN: ${vin}`);
          }
        } else {
          console.log(`No assets found for VIN: ${vin}`);
        }
      } else {
        console.log("VIN is undefined for car:", data);
      }
    }
  } catch (error) {
    console.error("Error updating local database:", error);
  }
}

export async function fetchAssets(
  vin: string,
): Promise<APIAssets[] | undefined> {
  try {
    const token = await ensureToken();

    if (!token) {
      throw new Error("No valid token available");
    }

    const res = await fetch(
      `https://backend.app.mtlworld.com/api/vehicle/${vin}/assets`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.ok) {
      throw new Error(
        `Failed to fetch assets for VIN: ${vin}, Status: ${res.status}`,
      );
    }

    const data: APIAssets[] = await res.json();

    return data;
  } catch (error) {
    console.error(`Error fetching assets for VIN: ${vin}:`, error);
    return undefined;
  }
}

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
