"use client";

import { useState } from "react";
import { handleUploadImage } from "@/lib/actions/bucketActions";

export default function Page() {
  const [file, setFile] = useState<File | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      console.error("No file selected");
      return;
    }

    console.log(file);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    const size = file.size;

    const url = await handleUploadImage("Container", "asd", size);
    console.log(url);

    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: buffer,
    });

    const data = await res.json();
    console.log(data);
  };

  return (
    <form onSubmit={handleUpload} method="PUT" encType="multipart/form-data">
      <input type="file" name="image" id="image" onChange={handleChange} />
      <button type="submit">Upload</button>
    </form>
  );
}
