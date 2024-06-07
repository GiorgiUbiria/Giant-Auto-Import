"use server";

import { APIAssetsResponse } from "@/lib/interfaces";
import { ensureToken } from "./tokenActions";
import sharp from "sharp";
import { APICarResponse } from "../api-interfaces";
import { fetchCars } from "./actions";
import { db } from "../drizzle/db";
import { imageTable } from "../drizzle/schema";

type NewImage = typeof imageTable.$inferInsert;

const insertImage = async (vin: string, imageUrl: string) => {
  const image: NewImage = {
    carVin: vin,
    imageUrl: imageUrl,
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
        const assets: APIAssetsResponse | undefined = await fetchAssets(
          specifications.vin,
        );

        if (assets) {
          const images = assets.assets.filter(
            (asset) => asset.type.toLowerCase() === "image",
          );
          if (images.length > 0) {
            for (const image of images) {
              const imageUrl = image.value;
              await insertImage(specifications.vin, imageUrl);
            }
          } else {
            console.log(`No image assets found for VIN: ${specifications.vin}`);
          }
        } else {
          console.log(`No assets found for VIN: ${specifications.vin}`);
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
): Promise<APIAssetsResponse | undefined> {
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

    const data: APIAssetsResponse = await res.json();
    return data;
  } catch (error) {
    console.error(`Error fetching assets for VIN: ${vin}:`, error);
    return undefined;
  }
}

export async function compressImageBuffer(imageBuffer: Buffer) {
  const compressedBuffer = await sharp(imageBuffer)
    .resize({ width: 400 })
    .jpeg({ quality: 50 })
    .toBuffer();

  return compressedBuffer;
}

export async function fetchImageBuffer(imageUrl: string): Promise<Buffer> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image from ${imageUrl}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
