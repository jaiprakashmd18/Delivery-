import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }

    const filename = `uploads/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const blob = await put(filename, file, { access: "public" });

    return NextResponse.json({ url: blob.url, pathname: blob.pathname });
  } catch (error) {
    console.error("[POST /api/upload]", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
