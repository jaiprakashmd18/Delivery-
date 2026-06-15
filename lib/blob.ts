import { put, del } from "@vercel/blob";

export async function uploadFile(
  file: File,
  folder: string
): Promise<{ url: string; pathname: string }> {
  const filename = `${folder}/${file.name}`;

  const blob = await put(filename, file, {
    access: "public",
    addRandomSuffix: true,
  });

  return {
    url: blob.url,
    pathname: blob.pathname,
  };
}

export async function deleteFile(url: string): Promise<void> {
  await del(url);
}

export function getPublicUrl(pathname: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BLOB_URL;
  if (!baseUrl) {
    throw new Error('Missing environment variable: "NEXT_PUBLIC_BLOB_URL"');
  }
  const cleanBase = baseUrl.replace(/\/$/, "");
  const cleanPath = pathname.replace(/^\//, "");
  return `${cleanBase}/${cleanPath}`;
}

export async function uploadMultipleFiles(
  files: File[],
  folder: string
): Promise<Array<{ url: string; pathname: string }>> {
  return Promise.all(files.map((file) => uploadFile(file, folder)));
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

export function validateFileSize(file: File, maxSizeMB: number): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
}
