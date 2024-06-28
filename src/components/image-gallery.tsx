"use client";

import React from "react";
import Image from "next/image";
import { Image as ImageType } from "@/lib/interfaces";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";

export function FeaturedImageGallery({ data }: { data: ImageType[] }) {
  const [active, setActive] = React.useState(data.at(0)?.imageUrl);
  const [screenWidth, setScreenWidth] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setScreenWidth(window.screen.width);

      const handleResize = () => {
        setScreenWidth(window.screen.width);
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  if (data.length === 0) {
    return (
      <div className="w-[480px]">
        <div className="grid gap-4">
          <div className="flex flex-col items-center justify-center h-[480px] w-full max-w-full rounded-lg bg-gray-200">
            <p className="text-gray-600">No images found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <div className="grid gap-4">
        <div>
          <Image
            className="h-auto w-full max-w-full rounded-lg object-cover object-center md:h-[480px]"
            src={active!}
            alt="car"
            width="400"
            height="400"
          />
        </div>
        <div className="grid grid-cols-5 gap-4">
          {data.slice(0, 4).map(({ imageUrl }, index) => (
            <div key={index}>
              <Image
                onClick={() => setActive(imageUrl)}
                src={imageUrl!}
                width="100"
                height="100"
                className="h-20 max-w-full cursor-pointer rounded-lg object-cover object-center"
                alt="gallery-image"
              />
            </div>
          ))}
          {data.length > 4 && (
            <Dialog>
              <DialogTrigger className="h-20 flex items-center justify-center rounded-lg border border-dashed border-gray-400 text-gray-600 hover:bg-gray-100 cursor-pointer">
                Show All
              </DialogTrigger>
              <DialogContent className="min-w-full p-14 sm:flex sm:justify-center sm:items-center">
                <Carousel
                  opts={{
                    align: "start",
                  }}
                  orientation={screenWidth! > 768 ? "horizontal" : "vertical"}
                  className="md:max-w-full sm:max-w-xs"
                >
                  <CarouselContent className="-ml-1 sm:h-[200px] md:p-24">
                    {data.map(({ imageUrl }, index) => (
                      <CarouselItem
                        key={index}
                        className="sm:basis-1 md:basis-1/2 lg:basis-1/3"
                      >
                        <div className="sm:p-1">
                          <Image
                            key={index}
                            src={imageUrl!}
                            width="500"
                            height="500"
                            className="object-cover rounded-lg hover:cursor-pointer"
                            alt="carousel-image"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
}
