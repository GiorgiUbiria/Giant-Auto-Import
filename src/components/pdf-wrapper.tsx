"use client";
import React, { useEffect, useRef } from "react";
import PSPDFKit from "pspdfkit";

interface PdfDataInterface {
  billedTo: string;
  paymentDate: string;
}

interface PSPDFKitWrapperProps {
  documentPath: string;
  data: PdfDataInterface;
}

const PSPDFKitWrapper: React.FC<PSPDFKitWrapperProps> = ({
  documentPath,
  data,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadAndProcessPdf = async () => {
      const container = containerRef.current;

      if (!container) {
        console.error("Container not found");
        return;
      }

      try {
        const instance = await PSPDFKit.load({
          container,
          document: documentPath,
          baseUrl: `${window.location.protocol}//${window.location.host}/`,
          initialViewState: new PSPDFKit.ViewState({ readOnly: true }),
        });

        let searchQuery = "Company Ltd.";
        let searchResults = await instance.search(searchQuery);
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
  }, [data.paymentDate, data.billedTo, documentPath]);

  return <div ref={containerRef} id="pspdfkit" style={{ height: "100vh" }} />;
};

export default PSPDFKitWrapper;
