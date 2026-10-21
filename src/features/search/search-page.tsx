"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import Icon from "@/components/icon";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import SearchResults from "./search-results";

export default function SearchPage() {
  const router = useRouter();
  const { token, ready } = useAuthGuard();
  const [q, setQ] = useState("");

  // Desktop memakai dropdown di header, jadi halaman ini hanya untuk mobile
  useEffect(() => {
    if (window.matchMedia("(min-width: 768px)").matches) router.replace("/");
  }, [router]);

  if (!ready) return <div className="min-h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex items-center gap-3 border-b border-[#181D27] px-4 py-3">
        <div className="relative flex-1">
          <Icon
            name="logo-search"
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            className="h-11 w-full rounded-full border border-[#181D27] bg-[#0A0D12] pl-11 pr-10 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-[#6936F2]"
          />
          {q && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQ("")}
              className="absolute right-4 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-500 text-black"
            >
              <X size={10} strokeWidth={3} />
            </button>
          )}
        </div>

        <button
          type="button"
          aria-label="Close search"
          onClick={() => router.back()}
        >
          <X size={28} />
        </button>
      </div>

      <div className="px-4 pt-4">
        {q.trim() ? (
          <SearchResults token={token} term={q} />
        ) : (
          <p className="p-3 text-sm text-neutral-400">
            Search for people by name or username.
          </p>
        )}
      </div>
    </div>
  );
}
