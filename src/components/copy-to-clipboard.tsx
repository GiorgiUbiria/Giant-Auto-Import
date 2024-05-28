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
      variant="outline"
      className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
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
      <span className="sr-only">Copy Order ID</span>
    </Button>
  );
}
