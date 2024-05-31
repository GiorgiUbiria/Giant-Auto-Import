"use server";

import { APIAssetsResponse } from "@/lib/interfaces";
import { ensureToken } from "./tokenActions";
import sharp from "sharp";

export async function compressImageBuffer(imageBuffer: Buffer) {
  const compressedBuffer = await sharp(imageBuffer)
    .resize({ width: 400 })
    .jpeg({ quality: 50 })
    .toBuffer();

  return compressedBuffer;
}

export async function getImagesByVinFromAPI(
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
      throw new Error("Failed to fetch car");
    }

    const data: APIAssetsResponse = await res.json();
    return data;
  } catch (e) {
    console.error(e);
  }
}

export async function fetchImageBuffer(imageUrl: string): Promise<Buffer> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image from ${imageUrl}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
