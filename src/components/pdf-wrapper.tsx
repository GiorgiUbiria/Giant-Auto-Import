"use client";

import React, { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PSPDFKit from "pspdfkit";

interface PdfDataInterface {
  billedTo: string;
  paymentDate: string;
  vin: string;
}

interface PSPDFKitWrapperProps {
  documentPath: string;
  data: PdfDataInterface;
  token: string;
  id: string;
}

const PSPDFKitWrapper: React.FC<PSPDFKitWrapperProps> = ({
  documentPath,
  data,
  token,
  id,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchParams = useSearchParams();
  const pdfToken = searchParams.get("token");
  const userId = searchParams.get("userId");
  const vin = searchParams.get("vin");
  const router = useRouter();

  useEffect(() => {
    if (!pdfToken || pdfToken !== token) {
      router.push("/");
      return;
    }

    if (!userId || userId !== id) {
      router.push("/");
      return;
    }

    if (!vin) {
      router.push("/");
      return;
    }

    data.vin = vin;

    const loadAndProcessPdf = async () => {
      const container = containerRef.current;

      if (!container) {
        console.error("Container not found");
        return;
      }

      try {
        if (PSPDFKit) {
          PSPDFKit.unload(container);
        }

        const instance = await PSPDFKit.load({
          container,
          document: documentPath,
          baseUrl: `${window.location.protocol}//${window.location.host}/`,
          initialViewState: new PSPDFKit.ViewState({ readOnly: true }),
        });

        let searchQuery = "Company Ltd.";
        let searchResults = await instance.search(searchQuery) as any;
        let bbox = searchResults.first().rectsOnPage.get(0);

        const estimatedWidth = Math.max(bbox.width, data.billedTo.length * 5);
        const estimatedHeight = bbox.height + 1;

        const adjustedBbox = new PSPDFKit.Geometry.Rect({
          left: bbox.left - 1,
          top: bbox.top,
          width: estimatedWidth,
          height: estimatedHeight,
        });

        let textAnnotation = new PSPDFKit.Annotations.TextAnnotation({
          boundingBox: adjustedBbox,
          fontSize: 10,
          text: {
            format: "plain",
            value: data.billedTo,
          },
          pageIndex: 0,
          fontColor: PSPDFKit.Color.BLACK,
          backgroundColor: PSPDFKit.Color.WHITE,
        });
        await instance.create(textAnnotation);

        searchQuery = "November 22nd 2021";
        searchResults = await instance.search(searchQuery);
        bbox = searchResults.first().rectsOnPage.get(0);
        textAnnotation = new PSPDFKit.Annotations.TextAnnotation({
          boundingBox: bbox,
          fontSize: 10,
          text: {
            format: "plain",
            value: data.paymentDate,
          },
          pageIndex: 0,
          fontColor: PSPDFKit.Color.BLACK,
          backgroundColor: PSPDFKit.Color.WHITE,
        });
        await instance.create(textAnnotation);

        await instance.exportPDF({ flatten: true });
      } catch (error) {
        console.error("Failed to process PDF:", error);
      }
    };

    loadAndProcessPdf();

    return () => {
      const container = containerRef.current;
      if (container) {
        PSPDFKit.unload(container);
      }
    };
  }, [data.paymentDate, data.billedTo, pdfToken, token, router, documentPath, userId, id, vin, data]);

  return <div ref={containerRef} id="pspdfkit" style={{ height: "100vh" }} />;
};

export default PSPDFKitWrapper;
