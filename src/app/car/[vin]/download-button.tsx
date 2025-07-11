"use client";

import { Button } from "@/components/ui/button";

const publicUrl = process.env.NEXT_PUBLIC_BUCKET_URL!;

export default function DownloadButton({
  content,
  vin,
}: {
  content: {imageKey: string}[] | undefined;
  vin: string;
}) {
  const handleDownload = async () => {
    if (!content || content.length === 0) return;

    // Dynamically import heavy libraries only when needed. 
    // We use `any` to avoid the need for type declarations which adds extra weight.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const JSZip = (await import("jszip")) as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fileSaver = (await import("file-saver")) as any;
    const saveAs = fileSaver.saveAs;

    const zip = new JSZip();

    content.forEach((image, index) => {
      if (image.imageKey) {
        zip.file(
          `image_${index + 1}.jpg`,
          fetch(`${publicUrl}/${image.imageKey}`).then((response) =>
            response.blob(),
          ),
        );
      }
    });

    try {
      const blob = await zip.generateAsync({ type: "blob" });
      saveAs(blob, `VIN-${vin}-PHOTOS.zip`);
    } catch (error) {
      console.error("Failed to generate ZIP", error);
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