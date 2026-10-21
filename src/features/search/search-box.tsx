"use client";

import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { X } from "lucide-react";
import Icon from "@/components/icon";
import type { RootState } from "@/store";
import SearchResults from "./search-results";

export default function SearchBox() {
  const token = useSelector((s: RootState) => s.auth.token);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown saat klik di luar atau tekan Escape
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const showDropdown = open && q.trim().length > 0;

  return (
    <div ref={wrapperRef} className="relative w-full max-w-122.75">
      <Icon
        name="logo-search"
        size={20}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
      />
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search"
        className="h-11 w-full rounded-full border border-[#181D27] bg-[#0A0D12] pl-11 pr-10 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-[#6936F2]"
      />

      {q && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setQ("");
            setOpen(false);
          }}
          className="absolute right-4 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-500 text-black"
        >
          <X size={10} strokeWidth={3} />
        </button>
      )}

      {showDropdown && (
        <div className="absolute left-0 top-full z-50 mt-2 max-h-100 w-full overflow-y-auto rounded-xl border border-[#181D27] bg-[#0A0D12] p-2 shadow-xl">
          <SearchResults
            token={token}
            term={q}
            onSelect={() => {
              setOpen(false);
              setQ("");
            }}
          />
        </div>
      )}
    </div>
  );
}
