/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpToLine, CloudUpload, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value?: File;
  onChange: (file?: File) => void;
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const openPicker = () => inputRef.current?.click();

  const clear = () => {
    onChange(undefined);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onChange(file);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onChange(file);
          e.target.value = "";
        }}
      />

      {preview ? (
        <div className="rounded-xl border border-dashed border-[#252B37] bg-[#0A0D12] p-6">
          <img
            src={preview}
            alt="Preview"
            className="aspect-square w-full object-cover"
          />
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={openPicker}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#252B37] bg-[#181D27]/60 px-3 text-sm font-semibold text-white hover:bg-[#181D27]"
            >
              <ArrowUpToLine size={18} />
              Change Image
            </button>
            <button
              type="button"
              onClick={clear}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#252B37] bg-[#181D27]/60 px-3 text-sm font-semibold text-[#D9206B] hover:bg-[#181D27]"
            >
              <Trash2 size={18} />
              Delete Image
            </button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={openPicker}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") openPicker();
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "flex h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-[#0A0D12] px-4 text-center transition-colors",
            dragging ? "border-[#6936F2]" : "border-[#252B37]",
          )}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#181D27] bg-black/40 text-neutral-300">
            <CloudUpload size={20} />
          </span>
          <p className="text-sm text-neutral-400">
            <span className="font-semibold text-[#7F51F9]">
              Click to upload
            </span>{" "}
            or drag and drop
          </p>
          <p className="text-sm text-neutral-500">PNG or JPG (max. 5mb)</p>
        </div>
      )}
    </>
  );
}
