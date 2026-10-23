"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, LogOut } from "lucide-react";
import Icon from "@/components/icon";
import Avatar from "@/components/avatar";
import SearchBox from "@/features/search/search-box";
import { TOKEN_KEY } from "@/features/auth/use-login";
import { logout } from "@/store/auth-slice";
import { cn } from "@/lib/utils";
import type { User } from "@/types/post";

interface AppHeaderProps {
  user?: User;
  mobileTitle?: string;
}

export default function AppHeader({ user, mobileTitle }: AppHeaderProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const onLogout = () => {
    setOpen(false);
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {}
    dispatch(logout());
    qc.clear();
    router.replace("/login");
  };

  const itemClass =
    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-white/5";

  return (
    <header className="sticky top-0 z-40 border-b border-[#181D27] bg-black/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-300 items-center justify-between gap-4 px-4 md:h-18 md:px-6">
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

        <div className="hidden w-full max-w-122.75 md:block">
          <SearchBox />
        </div>

        <div className="flex items-center gap-4">
          {!mobileTitle && (
            <Link href="/search" aria-label="Search" className="md:hidden">
              <Icon name="logo-search" size={24} className="text-white" />
            </Link>
          )}

          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={open}
              className="flex items-center gap-3"
            >
              <Avatar
                src={user?.avatarUrl}
                name={user?.name ?? "U"}
                size={40}
              />
              <span className="hidden text-sm font-semibold md:block">
                {user?.name}
              </span>
            </button>

            {open && (
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-[#252B37] bg-[#0A0D12] p-1 shadow-xl"
              >
                <Link
                  href="/profile"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className={itemClass}
                >
                  Profile
                </Link>
                <Link
                  href="/profile/likes"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className={itemClass}
                >
                  My Likes
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={onLogout}
                  className={cn(itemClass, "text-[#D9206B]")}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
