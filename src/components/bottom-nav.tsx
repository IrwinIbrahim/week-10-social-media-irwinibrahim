"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/icon";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const pathname = usePathname();

  const itemClass = (active: boolean) =>
    cn(
      "flex flex-col items-center gap-1 text-xs font-semibold",
      active ? "text-[#7F51F9]" : "text-white",
    );

  return (
    <nav className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div className="flex h-16 w-full max-w-90 items-center justify-around rounded-full border border-white/10 bg-[#0A0D12]/95 backdrop-blur">
        <Link href="/" className={itemClass(pathname === "/")}>
          <Icon name="logo-home" size={24} />
          Home
        </Link>

        <Link
          href="/posts/new"
          aria-label="Add post"
          className="flex h-12 w-12 shrink-0 items-center justify-center transition-transform hover:scale-105"
        >
          <Image
            src="/icons/logo-add.svg"
            alt=""
            width={48}
            height={48}
            className="h-12 w-12"
          />
        </Link>

        <Link
          href="/profile"
          className={itemClass(pathname.startsWith("/profile"))}
        >
          <Icon name="logo-profile" size={24} />
          Profile
        </Link>
      </div>
    </nav>
  );
}
