"use client";

import { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

export default function Page() {
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [invoiceType, setInvoiceType] = useState<string>("");

  const loadPdf = async (filePath: string) => {
    const response = await fetch(filePath);
    const arrayBuffer = await response.arrayBuffer();
    return arrayBuffer;
  };

  const editPdf = async (existingPdfBytes: ArrayBuffer, type: string) => {
    console.log(type);
    console.log("Editing PDF");
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    pdfDoc.registerFontkit(fontkit);

    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const form = pdfDoc.getForm();

    const invoiceNumber = form.getTextField("Text1");
    invoiceNumber.setText("User Name");

    const salesPrice = form.getTextField("Text3");
    salesPrice.setText("$$$ Sales Price");

    const auctionFee = form.getTextField("Text4");
    auctionFee.setText("$$$ Auction Fee");

    const transactionFee = form.getTextField("Text5");
    transactionFee.setText("$$$ Transaction Fee");

    const vehicle = form.getTextField("Text10");
    vehicle.setText("Toyota Corolla");

    const lotNumber = form.getTextField("Text11");
    lotNumber.setText("Lot Number");

    const vinCode = form.getTextField("Text12");
    vinCode.setText("Vin Code");

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  };

  const handleSelectChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const selectedType = e.target.value;
    setInvoiceType(selectedType);

    if (selectedType) {
      const arrayBuffer = await loadPdf(selectedType);
      const editedPdfBytes = await editPdf(arrayBuffer, selectedType);
      setPdfBytes(editedPdfBytes);
    } else {
      setPdfBytes(null);
    }
  };

  const downloadPdf = () => {
    if (pdfBytes) {
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "edited.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div>
      <h1>PDF.js Example</h1>
      <select onChange={handleSelectChange}>
        <option value="">Select a PDF</option>
        <option value="/invoice-copart.pdf">Invoice Copart</option>
        <option value="/invoice-iaai.pdf">Invoice IAAI</option>
        <option value="/invoice-shipping.pdf">Invoice Shipping</option>
      </select>
      <button onClick={downloadPdf} disabled={!pdfBytes}>
        Download Edited PDF
      </button>
    </div>
  );
}
