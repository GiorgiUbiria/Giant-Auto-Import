"use client";
import { useEffect, useRef } from "react";
import PSPDFKit from "pspdfkit";

const Page: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const data = {
    billedTo: "Giorgi", // in template - Company Ltd.
    paymentDate: new Date().toLocaleDateString(), // in template - November 22nd 2021
    company: "Giant Auto Import", // in template - COMPANY
  };

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
          document: "/document.pdf",
          baseUrl: `${window.location.protocol}//${window.location.host}/`,
          initialViewState: new PSPDFKit.ViewState({ readOnly: true }),
        });

        let searchQuery = "Company Ltd.";
        let searchResults = await instance.search(searchQuery);
        let bbox = searchResults.first().rectsOnPage.get(0);
        const estimatedWidth = Math.max(bbox.width, data.company.length * 5); // Simple heuristic
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
            value: data.company,
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
          fontSize: 8,
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
  }, [data.paymentDate]);

  return <div ref={containerRef} id="pspdfkit" style={{ height: "100vh" }} />;
};

export default Page;
