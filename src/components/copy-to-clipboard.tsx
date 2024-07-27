"use client";

import { useState } from "react";
import { Copy, CopyCheckIcon } from "lucide-react";
import { Button } from "./ui/button";

export default function CopyToClipBoard({ text }: { text: string }) {
  const [isCopying, setIsCopying] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  const handleCopy = () => {
    setIsCopying(true);
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setIsCopying(false);
        setShowCopied(true);
        setTimeout(() => {
          setShowCopied(false);
        }, 1000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        setIsCopying(false);
      });
  };

  return (
    <Button
      size="icon"
      variant="ghost"
      className="h-3 w-3 opacity-100"
      onClick={handleCopy}
      disabled={isCopying}
    >
      {showCopied ? (
        <span className="flex items-center w-fit">
          <CopyCheckIcon className="h-3 w-3" />
        </span>
      ) : (
        <Copy className="h-3 w-3" />
      )}
      <span className="sr-only">Copy VIN code</span>
    </Button>
  );
}
