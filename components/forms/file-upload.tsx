"use client";

import { useRef, useState } from "react";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onUpload: (url: string) => void;
  label?: string;
}

export function FileUpload({ onUpload, label = "Upload Screenshot" }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();
      onUpload(data.url);
      toast.success("Screenshot uploaded");
    } catch {
      toast.error("Failed to upload screenshot. Please try again.");
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onUpload("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
          <span className="text-muted-foreground ml-1">(Optional)</span>
        </label>
      )}

      {previewUrl ? (
        <div className="relative rounded-xl overflow-hidden border border-border bg-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Uploaded screenshot"
            className="w-full h-48 object-cover"
          />
          {uploading && (
            <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          )}
          {!uploading && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-background border border-border transition-colors"
            >
              <X className="w-4 h-4 text-foreground" />
            </button>
          )}
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            "relative flex flex-col items-center justify-center gap-3 h-36 rounded-xl border-2 border-dashed cursor-pointer transition-all",
            dragOver
              ? "border-primary-500 bg-primary-50 dark:bg-primary-900/10"
              : "border-border hover:border-primary-400 hover:bg-card"
          )}
        >
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
            dragOver ? "bg-primary-100 dark:bg-primary-900/20" : "bg-muted"
          )}>
            {dragOver ? (
              <ImageIcon className="w-6 h-6 text-primary-500" />
            ) : (
              <Upload className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              {dragOver ? "Drop to upload" : "Click or drag & drop"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              PNG, JPG, WEBP up to 10MB
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleInputChange}
          />
        </div>
      )}
    </div>
  );
}
