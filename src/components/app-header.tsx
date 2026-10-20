"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Icon from "@/components/icon";
import Avatar from "@/components/avatar";
import { cn } from "@/lib/utils";
import type { User } from "@/types/post";

interface AppHeaderProps {
  user?: User;
  mobileTitle?: string;
}

export default function AppHeader({ user, mobileTitle }: AppHeaderProps) {
  const router = useRouter();
  const [q, setQ] = useState("");

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#181D27] bg-black/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-300 items-center justify-between gap-4 px-4 md:h-18 md:px-6">
        {/* Mobile: back + title (khusus halaman yang memakai mobileTitle) */}
        {mobileTitle && (
          <div className="flex items-center gap-3 md:hidden">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Back"
            >
              <ArrowLeft size={24} />
            </button>
            <span className="text-base font-bold">{mobileTitle}</span>
          </div>
        )}

        <Link
          href="/"
          className={cn(
            "items-center gap-2",
            mobileTitle ? "hidden md:flex" : "flex",
          )}
        >
          <Image
            src="/icons/logo-sociality.svg"
            alt="Sociality"
            width={32}
            height={32}
            priority
          />
          <span className="text-xl font-bold">Sociality</span>
        </Link>

        {/* Desktop search */}
        <form
          onSubmit={onSearch}
          className="relative hidden w-full max-w-122.75 md:block"
        >
          <Icon
            name="logo-search"
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            className="h-11 w-full rounded-full border border-[#181D27] bg-[#0A0D12] pl-11 pr-4 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-[#6936F2]"
          />
        </form>

        <div className="flex items-center gap-4">
          {!mobileTitle && (
            <Link href="/search" aria-label="Search" className="md:hidden">
              <Icon name="logo-search" size={24} className="text-white" />
            </Link>
          )}

          <Link href="/profile" className="flex items-center gap-3">
            <Avatar src={user?.avatarUrl} name={user?.name ?? "U"} size={40} />
            <span className="hidden text-sm font-semibold md:block">
              {user?.name}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
