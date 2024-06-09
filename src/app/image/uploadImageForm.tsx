"use client";

import { useState } from "react";
import { handleUploadImages } from "@/lib/actions/bucketActions";

export default function UploadImageForm({vins} : {vins: string[]}) {
  const [files, setFiles] = useState<File[]>([]);
  const [vin, setVin] = useState<string>("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFiles(Array.from(event.target.files));
    } else {
      setFiles([]);
    }
  };

  const handleChangeVin = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setVin(event.target.value);
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (files.length === 0) {
      console.error("No files selected");
      return;
    }

    const fileData = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        return {
          buffer: new Uint8Array(arrayBuffer),
          size: file.size,
          type: file.type,
          name: file.name,
        };
      }),
    );

    const urls = await handleUploadImages(
      "Container",
      vin,
      fileData.map((file) => file.size),
    );

    await Promise.all(
      urls.map((url: string, index: number) =>
        fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": files[index].type,
          },
          body: fileData[index].buffer,
        }),
      ),
    );

    console.log("All files uploaded successfully");
  };

  return (
    <form onSubmit={handleUpload} method="PUT" encType="multipart/form-data">
      <input
        type="file"
        name="images"
        id="images"
        onChange={handleChange}
        multiple
      />
      <select name="vin" id="vin" onChange={handleChangeVin}>
        <option value="">Select a car</option>
        {vins.map((vin) => (
          <option key={vin} value={vin}>
            {vin}
          </option>
        ))}
      </select>
      <button type="submit">Upload</button>
    </form>
  );
}
