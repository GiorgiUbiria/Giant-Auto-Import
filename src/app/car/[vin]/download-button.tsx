"use client";

import { Button } from "@/components/ui/button";
import { Image as ImageType } from "@/lib/interfaces";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export default function DownloadButton({
  content,
  vin,
}: {
  content: ImageType[] | undefined;
  vin: string;
}) {
  const handleDownload = async () => {
    if (content && content.length > 0) {
      const zip = new JSZip();

      content.forEach((image, index) => {
        if (image.imageUrl) {
          zip.file(
            `image_${index + 1}.jpg`,
            fetch(image.imageUrl).then((response) => response.blob()),
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
      className="w-full mt-4"
      onClick={handleDownload}
    >
      Download All Images as ZIP
    </Button>
  );
}
