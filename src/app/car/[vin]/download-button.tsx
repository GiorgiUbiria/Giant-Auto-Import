"use client";

import { Button } from "@/components/ui/button";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const publicUrl = process.env.NEXT_PUBLIC_BUCKET_URL!;

export default function DownloadButton({
  content,
  vin,
}: {
  content: {imageKey: string}[] | undefined;
  vin: string;
}) {
  const handleDownload = async () => {
    if (content && content.length > 0) {
      const zip = new JSZip();

  content.forEach((image, index) => {
        if (image.imageKey) {
          zip.file(
            `image_${index + 1}.jpg`,
            fetch(`${publicUrl}/${image.imageKey}`).then((response) => response.blob()),
          );
        }
      });

      zip
        .generateAsync({ type: "blob" })
        .then((blob) => {
          saveAs(blob, `VIN-${vin}-PHOTOS.zip`);
        })
        .catch((error) => {
          console.error("Failed to generate ZIP", error);
        });
    }
  };

  return (
    <Button
      variant="default"
      size="lg"
      className="w-full mt-4 text-sm sm:text-base"
      onClick={handleDownload}
    >
      Download All Images as ZIP
    </Button>
  );
}