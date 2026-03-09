import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const chunkRootPath = "/app/.uploads/chunks";

export async function POST(request) {
  try {
    const formData = await request.formData();

    const uploadId = String(formData.get("uploadId") || "").trim();
    const docType = String(formData.get("docType") || "").trim();
    const chunkIndex = String(formData.get("chunkIndex") || "").trim();
    const chunkFile = formData.get("chunk");

    if (!uploadId || !docType || chunkIndex === "" || !chunkFile) {
      return NextResponse.json(
        { message: "Missing chunk upload fields." },
        { status: 400 }
      );
    }

    const uploadDir = path.join(chunkRootPath, uploadId);
    await mkdir(uploadDir, { recursive: true });

    const chunkArrayBuffer = await chunkFile.arrayBuffer();
    const chunkBuffer = Buffer.from(chunkArrayBuffer);
    const chunkPath = path.join(uploadDir, `${chunkIndex}.part`);

    await writeFile(chunkPath, chunkBuffer);

    return NextResponse.json({ message: "Chunk uploaded." }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to upload chunk.",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
