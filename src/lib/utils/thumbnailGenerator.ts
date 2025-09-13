"use client";

import imageCompression from "browser-image-compression";

export interface ThumbnailOptions {
  maxWidthOrHeight: number;
  maxSizeMB: number;
  initialQuality: number;
  fileType: string;
}

export const THUMBNAIL_OPTIONS: ThumbnailOptions = {
  maxWidthOrHeight: 480,
  maxSizeMB: 0.25,
  initialQuality: 0.5,
  fileType: "image/png",
};

export const PREVIEW_OPTIONS: ThumbnailOptions = {
  maxWidthOrHeight: 200,
  maxSizeMB: 0.1,
  initialQuality: 0.4,
  fileType: "image/png",
};

export async function generateThumbnail(
  file: File,
  options: ThumbnailOptions = THUMBNAIL_OPTIONS
): Promise<File> {
  try {
    const thumbnail = await imageCompression(file, {
      maxSizeMB: options.maxSizeMB,
      maxWidthOrHeight: options.maxWidthOrHeight,
      initialQuality: options.initialQuality,
      useWebWorker: true,
      fileType: options.fileType as any,
    });

    console.log(
      `Generated thumbnail for ${file.name}: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(thumbnail.size / 1024 / 1024).toFixed(2)}MB`
    );
    return thumbnail;
  } catch (error) {
    console.warn(`Thumbnail generation failed for ${file.name}, using original:`, error);
    return file;
  }
}

export async function generatePreview(
  file: File,
  options: ThumbnailOptions = PREVIEW_OPTIONS
): Promise<File> {
  try {
    const preview = await imageCompression(file, {
      maxSizeMB: options.maxSizeMB,
      maxWidthOrHeight: options.maxWidthOrHeight,
      initialQuality: options.initialQuality,
      useWebWorker: true,
      fileType: options.fileType as any,
    });

    console.log(
      `Generated preview for ${file.name}: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(preview.size / 1024 / 1024).toFixed(2)}MB`
    );
    return preview;
  } catch (error) {
    console.warn(`Preview generation failed for ${file.name}, using original:`, error);
    return file;
  }
}

export async function generateImageVariants(file: File): Promise<{
  original: File;
  thumbnail: File;
  preview: File;
}> {
  const [thumbnail, preview] = await Promise.all([generateThumbnail(file), generatePreview(file)]);

  return {
    original: file,
    thumbnail,
    preview,
  };
}

export function getThumbnailKey(originalKey: string): string {
  // Convert "VIN/TYPE/1.png" to "VIN/TYPE/thumb_1.png"
  const parts = originalKey.split("/");
  const filename = parts[parts.length - 1];
  const nameWithoutExt = filename.split(".")[0];
  const ext = filename.split(".").slice(1).join(".");

  parts[parts.length - 1] = `thumb_${nameWithoutExt}.${ext}`;
  return parts.join("/");
}

export function getPreviewKey(originalKey: string): string {
  // Convert "VIN/TYPE/1.png" to "VIN/TYPE/preview_1.png"
  const parts = originalKey.split("/");
  const filename = parts[parts.length - 1];
  const nameWithoutExt = filename.split(".")[0];
  const ext = filename.split(".").slice(1).join(".");

  parts[parts.length - 1] = `preview_${nameWithoutExt}.${ext}`;
  return parts.join("/");
}

export function isThumbnailKey(key: string): boolean {
  return key.includes("/thumb_");
}

export function isPreviewKey(key: string): boolean {
  return key.includes("/preview_");
}

export function getOriginalKeyFromThumbnail(thumbnailKey: string): string {
  // Convert "VIN/TYPE/thumb_1.png" to "VIN/TYPE/1.png"
  return thumbnailKey.replace("/thumb_", "/");
}

export function getOriginalKeyFromPreview(previewKey: string): string {
  // Convert "VIN/TYPE/preview_1.png" to "VIN/TYPE/1.png"
  return previewKey.replace("/preview_", "/");
}
