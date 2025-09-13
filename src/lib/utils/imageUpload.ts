"use client";

import imageCompression from "browser-image-compression";
import { toast } from "sonner";
import { generateImageVariants } from "./thumbnailGenerator";

export interface ImageUploadOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  initialQuality?: number;
  useWebWorker?: boolean;
  fileType?: string;
}

export interface ImageUploadResult {
  success: boolean;
  uploadedCount: number;
  failedCount: number;
  failedImages: string[];
  message: string;
}

export interface ProcessedImage {
  buffer: number[];
  size: number;
  name: string;
  type: "AUCTION" | "WAREHOUSE" | "DELIVERY" | "PICK_UP";
}

const DEFAULT_COMPRESSION_OPTIONS: ImageUploadOptions = {
  maxSizeMB: 1.5,
  maxWidthOrHeight: 1920,
  initialQuality: 0.6,
  useWebWorker: true,
  fileType: "image/png",
};

const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpg", "image/jpeg", "image/webp"];
const MAX_IMAGE_SIZE = 4; // MB

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not supported. Please use PNG, JPG, JPEG, or WebP.`,
    };
  }

  // Check file size
  const sizeInMB = file.size / (1024 * 1024);
  if (sizeInMB > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `File size ${sizeInMB.toFixed(2)}MB exceeds maximum allowed size of ${MAX_IMAGE_SIZE}MB.`,
    };
  }

  return { valid: true };
}

export async function compressImage(
  file: File,
  options: ImageUploadOptions = DEFAULT_COMPRESSION_OPTIONS
): Promise<File> {
  try {
    const compressedFile = await imageCompression(file, {
      maxSizeMB: options.maxSizeMB || DEFAULT_COMPRESSION_OPTIONS.maxSizeMB,
      maxWidthOrHeight: options.maxWidthOrHeight || DEFAULT_COMPRESSION_OPTIONS.maxWidthOrHeight,
      initialQuality: options.initialQuality || DEFAULT_COMPRESSION_OPTIONS.initialQuality,
      useWebWorker: options.useWebWorker ?? DEFAULT_COMPRESSION_OPTIONS.useWebWorker,
      fileType: options.fileType || DEFAULT_COMPRESSION_OPTIONS.fileType,
    });

    console.log(
      `Compressed ${file.name}: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`
    );
    return compressedFile;
  } catch (error) {
    console.warn(`Compression failed for ${file.name}, using original:`, error);
    return file;
  }
}

export async function processImageFiles(
  files: FileList | File[],
  imageType: "AUCTION" | "WAREHOUSE" | "DELIVERY" | "PICK_UP",
  options: ImageUploadOptions = DEFAULT_COMPRESSION_OPTIONS
): Promise<ProcessedImage[]> {
  const fileArray = Array.isArray(files) ? files : Array.from(files);
  const processedImages: ProcessedImage[] = [];

  for (const file of fileArray) {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      console.warn(`Skipping invalid file ${file.name}: ${validation.error}`);
      continue;
    }

    try {
      // Compress image
      const compressedFile = await compressImage(file, options);

      // Convert to buffer
      const buffer = await compressedFile.arrayBuffer();

      processedImages.push({
        buffer: Array.from(new Uint8Array(buffer)),
        size: compressedFile.size,
        name: compressedFile.name,
        type: imageType,
      });
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
    }
  }

  return processedImages;
}

export async function uploadImagesToAPI(
  vin: string,
  images: ProcessedImage[],
  onProgress?: (uploaded: number, total: number) => void
): Promise<ImageUploadResult> {
  if (images.length === 0) {
    return {
      success: false,
      uploadedCount: 0,
      failedCount: 0,
      failedImages: [],
      message: "No images to upload",
    };
  }

  let uploadedCount = 0;
  let failedCount = 0;
  const failedImages: string[] = [];

  try {
    const response = await fetch(`/api/images/${vin}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images }),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      uploadedCount = result.uploadedCount || 0;
      failedCount = result.failedCount || 0;
      failedImages.push(...(result.failedImages || []));

      if (onProgress) {
        onProgress(uploadedCount, images.length);
      }

      return {
        success: true,
        uploadedCount,
        failedCount,
        failedImages,
        message: result.message || "Images uploaded successfully",
      };
    } else {
      throw new Error(result.message || "Upload failed");
    }
  } catch (error) {
    console.error("Error uploading images:", error);
    return {
      success: false,
      uploadedCount: 0,
      failedCount: images.length,
      failedImages: images.map((img) => img.name),
      message: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

export async function uploadImagesWithProgress(
  vin: string,
  imageFiles: Record<string, FileList | undefined>,
  onProgress?: (uploaded: number, total: number) => void,
  options: ImageUploadOptions = DEFAULT_COMPRESSION_OPTIONS
): Promise<ImageUploadResult> {
  const imageTypes = ["auction_images", "pick_up_images", "warehouse_images", "delivery_images"];
  const typeMapping: Record<string, "AUCTION" | "WAREHOUSE" | "DELIVERY" | "PICK_UP"> = {
    auction_images: "AUCTION",
    pick_up_images: "PICK_UP",
    warehouse_images: "WAREHOUSE",
    delivery_images: "DELIVERY",
  };

  let allProcessedImages: ProcessedImage[] = [];
  let totalFiles = 0;

  // Process all images
  for (const imageType of imageTypes) {
    const files = imageFiles[imageType];
    if (files && files.length > 0) {
      totalFiles += files.length;
      const processedImages = await processImageFiles(files, typeMapping[imageType], options);
      allProcessedImages.push(...processedImages);
    }
  }

  if (allProcessedImages.length === 0) {
    return {
      success: false,
      uploadedCount: 0,
      failedCount: 0,
      failedImages: [],
      message: "No valid images to upload",
    };
  }

  // Upload in batches to avoid overwhelming the server
  const batchSize = 5;
  let uploadedCount = 0;
  let failedCount = 0;
  const failedImages: string[] = [];

  for (let i = 0; i < allProcessedImages.length; i += batchSize) {
    const batch = allProcessedImages.slice(i, i + batchSize);

    const result = await uploadImagesToAPI(vin, batch, (batchUploaded, batchTotal) => {
      if (onProgress) {
        onProgress(uploadedCount + batchUploaded, allProcessedImages.length);
      }
    });

    uploadedCount += result.uploadedCount;
    failedCount += result.failedCount;
    failedImages.push(...result.failedImages);
  }

  const success = uploadedCount > 0;
  const message = success
    ? `Successfully uploaded ${uploadedCount} of ${allProcessedImages.length} images`
    : "Failed to upload any images";

  return {
    success,
    uploadedCount,
    failedCount,
    failedImages,
    message,
  };
}

export async function uploadImagesWithThumbnails(
  vin: string,
  imageFiles: Record<string, FileList | undefined>,
  onProgress?: (uploaded: number, total: number) => void,
  options: ImageUploadOptions = DEFAULT_COMPRESSION_OPTIONS
): Promise<ImageUploadResult> {
  const imageTypes = ["auction_images", "pick_up_images", "warehouse_images", "delivery_images"];
  const typeMapping: Record<string, "AUCTION" | "WAREHOUSE" | "DELIVERY" | "PICK_UP"> = {
    auction_images: "AUCTION",
    pick_up_images: "PICK_UP",
    warehouse_images: "WAREHOUSE",
    delivery_images: "DELIVERY",
  };

  let allProcessedImages: ProcessedImage[] = [];
  let totalFiles = 0;

  // Process all images with variants
  for (const imageType of imageTypes) {
    const files = imageFiles[imageType];
    if (files && files.length > 0) {
      totalFiles += files.length;

      for (const file of Array.from(files)) {
        try {
          // Generate variants (original, thumbnail, preview)
          const variants = await generateImageVariants(file);

          // Process original image
          const originalProcessed = await processImageFiles(
            [variants.original],
            typeMapping[imageType],
            options
          );

          // Process thumbnail
          const thumbnailProcessed = await processImageFiles(
            [variants.thumbnail],
            typeMapping[imageType],
            { ...options, maxSizeMB: 0.25, maxWidthOrHeight: 480 }
          );

          // Process preview
          const previewProcessed = await processImageFiles(
            [variants.preview],
            typeMapping[imageType],
            { ...options, maxSizeMB: 0.1, maxWidthOrHeight: 200 }
          );

          allProcessedImages.push(...originalProcessed, ...thumbnailProcessed, ...previewProcessed);
        } catch (error) {
          console.error(`Error processing variants for ${file.name}:`, error);
          // Fallback to single image upload
          const processedImages = await processImageFiles([file], typeMapping[imageType], options);
          allProcessedImages.push(...processedImages);
        }
      }
    }
  }

  if (allProcessedImages.length === 0) {
    return {
      success: false,
      uploadedCount: 0,
      failedCount: 0,
      failedImages: [],
      message: "No valid images to upload",
    };
  }

  // Upload in batches to avoid overwhelming the server
  const batchSize = 3; // Smaller batches for variants
  let uploadedCount = 0;
  let failedCount = 0;
  const failedImages: string[] = [];

  for (let i = 0; i < allProcessedImages.length; i += batchSize) {
    const batch = allProcessedImages.slice(i, i + batchSize);

    const result = await uploadImagesToAPI(vin, batch, (batchUploaded, batchTotal) => {
      if (onProgress) {
        onProgress(uploadedCount + batchUploaded, allProcessedImages.length);
      }
    });

    uploadedCount += result.uploadedCount;
    failedCount += result.failedCount;
    failedImages.push(...result.failedImages);
  }

  const success = uploadedCount > 0;
  const message = success
    ? `Successfully uploaded ${uploadedCount} of ${allProcessedImages.length} images (including thumbnails)`
    : "Failed to upload any images";

  return {
    success,
    uploadedCount,
    failedCount,
    failedImages,
    message,
  };
}

export function showUploadResult(result: ImageUploadResult) {
  if (result.success) {
    if (result.failedCount > 0) {
      toast.warning(`${result.message}. ${result.failedCount} images failed to upload.`);
    } else {
      toast.success(result.message);
    }
  } else {
    toast.error(result.message);
  }
}
