"use client";

import { Loader2 } from "lucide-react";
import type { GridChildComponentProps } from 'react-window';
import { FixedSizeGrid as Grid } from 'react-window';
import OptimizedImage, { OptimizedThumbnail } from "./optimized-image";

type ImageData = {
  imageKey: string;
  imageType: "WAREHOUSE" | "PICK_UP" | "DELIVERED" | "AUCTION";
  url: string;
  priority: boolean | null;
};

interface VirtualizedGridProps {
  images: ImageData[];
  onThumbClick: (idx: number) => void;
  loadedImages: Set<string>;
  isMobile: boolean;
}

const VirtualizedGrid = ({ 
  images, 
  onThumbClick, 
  loadedImages, 
  isMobile 
}: VirtualizedGridProps) => {
  const columnCount = isMobile ? 3 : 6;
  const rowCount = Math.ceil(images.length / columnCount);
  const cellWidth = 100;
  const cellHeight = 80;
  
  return (
    <Grid
      columnCount={columnCount}
      columnWidth={cellWidth}
      height={Math.min(320, rowCount * cellHeight)}
      rowCount={rowCount}
      rowHeight={cellHeight}
      width={columnCount * cellWidth}
    >
      {({ columnIndex, rowIndex, style }: GridChildComponentProps) => {
        const idx = rowIndex * columnCount + columnIndex;
        if (idx >= images.length) return null;
        const image = images[idx];
        const isLoaded = loadedImages.has(image.imageKey);
        
        return (
          <div style={style} key={image.imageKey} onClick={() => onThumbClick(idx)}>
            <div className="relative w-full h-full p-1">
              <OptimizedThumbnail
                src={image.url}
                alt={image.imageType}
                size={90}
                className={`rounded transition-opacity duration-300 ${
                  isLoaded ? 'opacity-100' : 'opacity-70'
                }`}
                onClick={() => onThumbClick(idx)}
              />
              {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>
          </div>
        );
      }}
    </Grid>
  );
};

export default VirtualizedGrid; 