"use client";

import { useState } from "react";
import Link from "next/link";
import AppHeader from "@/components/app-header";
import BottomNav from "@/components/bottom-nav";
import Avatar from "@/components/avatar";
import Icon from "@/components/icon";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useMe } from "@/features/feed/hooks";
import { cn } from "@/lib/utils";
import PostGrid from "./post-grid";
import type { ProfileTab } from "./hooks";

export default function ProfilePage() {
  const { token, ready } = useAuthGuard();
  const me = useMe(token);
  const [tab, setTab] = useState<ProfileTab>("gallery");

  if (!ready) return <div className="min-h-screen bg-black" />;

  const profile = me.data;

  const stats = [
    { label: "Post", value: profile?.stats.posts ?? 0 },
    { label: "Followers", value: profile?.stats.followers ?? 0 },
    { label: "Following", value: profile?.stats.following ?? 0 },
    { label: "Likes", value: profile?.stats.likes ?? 0 },
  ];

  const tabs: { key: ProfileTab; label: string; icon: string }[] = [
    { key: "gallery", label: "Gallery", icon: "logo-gallery" },
    { key: "saved", label: "Saved", icon: "logo-saved" },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <AppHeader user={profile} mobileTitle={profile?.name} />

      <main className="mx-auto w-full max-w-203 px-4 pb-32 pt-4 md:px-0 md:pt-8">
        {me.isError && (
          <p role="alert" className="mb-4 text-sm text-red-500">
            {me.error instanceof Error
              ? me.error.message
              : "Failed to load profile."}
          </p>
        )}

        {/* Identity + actions */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Avatar
              src={profile?.avatarUrl}
              name={profile?.name ?? "U"}
              size={64}
            />
            <div>
              <p className="text-sm font-bold md:text-base">
                {profile?.name ?? "..."}
              </p>
              <p className="mt-1 text-sm text-neutral-300">
                {profile?.username}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/profile/edit"
              className="flex h-11 flex-1 items-center justify-center rounded-full border border-[#252B37] text-sm font-bold hover:bg-white/5 md:w-32.5 md:flex-none"
            >
              Edit Profile
            </Link>
            <button
              type="button"
              aria-label="Share profile"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#252B37] hover:bg-white/5"
            >
              <Icon name="logo-share" size={20} className="text-white" />
            </button>
          </div>
        </div>

        {/* Bio */}
        {profile?.bio && (
          <p className="mt-4 whitespace-pre-line text-sm leading-6">
            {profile.bio}
          </p>
        )}

        {/* Stats */}
        <div className="mt-5 grid grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={cn(
                "flex flex-col items-center gap-1 py-1",
                i > 0 && "border-l border-[#181D27]",
              )}
            >
              <span className="text-xl font-bold">{s.value}</span>
              <span className="text-sm text-neutral-400">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mt-6 grid grid-cols-2 border-b border-[#181D27]">
          {tabs.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                aria-pressed={active}
                className={cn(
                  "-mb-px flex items-center justify-center gap-2 border-b-2 py-3 text-sm font-semibold transition-colors",
                  active
                    ? "border-white text-white"
                    : "border-transparent text-neutral-400 hover:text-white",
                )}
              >
                <Icon name={t.icon} size={20} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div className="mt-4">
          <PostGrid token={token} tab={tab} username={profile?.username} />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
