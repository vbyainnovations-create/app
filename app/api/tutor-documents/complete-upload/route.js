import { NextResponse } from "next/server";
import { mkdir, readFile, rm } from "node:fs/promises";
import path from "node:path";

const chunkRootPath = "/app/.uploads/chunks";
const bucketName = "tutor-documents";

const getExtension = (fileName) => {
  const ext = path.extname(fileName || "").toLowerCase();
  return ext || ".bin";
};

const encodeStoragePath = (storagePath) => {
  return storagePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
};

export async function POST(request) {
  try {
    const payload = await request.json();

    const uploadId = String(payload?.uploadId || "").trim();
    const docType = String(payload?.docType || "").trim();
    const fileName = String(payload?.fileName || "").trim();
    const totalChunks = Number(payload?.totalChunks || 0);

    if (!uploadId || !docType || !fileName || !totalChunks) {
      return NextResponse.json(
        { message: "Missing upload completion fields." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { message: "Supabase environment variables are missing." },
        { status: 500 }
      );
    }

    const uploadDir = path.join(chunkRootPath, uploadId);
    await mkdir(uploadDir, { recursive: true });

    const buffers = [];

    for (let i = 0; i < totalChunks; i += 1) {
      const chunkPath = path.join(uploadDir, `${i}.part`);
      const chunkBuffer = await readFile(chunkPath);
      buffers.push(chunkBuffer);
    }

    const mergedBuffer = Buffer.concat(buffers);
    const extension = getExtension(fileName);
    const storagePath = `${new Date().toISOString().slice(0, 10)}/${uploadId}-${docType}${extension}`;

    const storageUploadResponse = await fetch(
      `${supabaseUrl}/storage/v1/object/${bucketName}/${encodeStoragePath(storagePath)}`,
      {
        method: "POST",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/octet-stream",
          "x-upsert": "true",
        },
        body: mergedBuffer,
      }
    );

    if (!storageUploadResponse.ok) {
      const errorText = await storageUploadResponse.text();

      return NextResponse.json(
        {
          message: "Failed to upload document to secure storage.",
          details: errorText || "Unknown storage error",
        },
        { status: 502 }
      );
    }

    await rm(uploadDir, { recursive: true, force: true });

    return NextResponse.json(
      {
        message: "Document uploaded successfully.",
        bucket: bucketName,
        storage_path: storagePath,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to complete secure upload.",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
