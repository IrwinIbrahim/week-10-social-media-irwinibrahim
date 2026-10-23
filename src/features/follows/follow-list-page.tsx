"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import AppHeader from "@/components/app-header";
import BottomNav from "@/components/bottom-nav";
import Avatar from "@/components/avatar";
import { Button } from "@/components/ui/button";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useMe } from "@/features/feed/hooks";
import { cn } from "@/lib/utils";
import { useFollowList, useFollowUser, type FollowKind } from "./hooks";

export default function FollowListPage({
  kind,
  username,
}: {
  kind: FollowKind;
  username?: string;
}) {
  const router = useRouter();
  const { token, ready } = useAuthGuard();
  const me = useMe(token);
  const list = useFollowList(token, kind, username);
  const follow = useFollowUser(token);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = list;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (!ready) return <div className="min-h-screen bg-black" />;

  const title = kind === "followers" ? "Followers" : "Following";
  const users = list.data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="min-h-screen bg-black text-white">
      <AppHeader user={me.data} mobileTitle={title} />

      <main className="mx-auto w-full max-w-140 px-4 pb-32 pt-4 md:px-0 md:pt-8">
        <div className="mb-4 hidden items-center gap-3 md:flex">
          <button type="button" onClick={() => router.back()} aria-label="Back">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">{title}</h1>
        </div>

        {list.isLoading ? (
          <ul>
            {Array.from({ length: 5 }).map((_, i) => (
              <li
                key={i}
                className="flex animate-pulse items-center gap-3 py-3"
              >
                <div className="h-12 w-12 rounded-full bg-[#0A0D12]" />
                <div className="space-y-2">
                  <div className="h-3 w-28 rounded bg-[#0A0D12]" />
                  <div className="h-3 w-20 rounded bg-[#0A0D12]" />
                </div>
              </li>
            ))}
          </ul>
        ) : list.isError ? (
          <div className="py-16 text-center">
            <p className="text-sm text-red-500">{list.error.message}</p>
            <Button
              onClick={() => list.refetch()}
              className="mt-4 rounded-full bg-[#6936F2] text-white hover:bg-[#5b2bd9]"
            >
              Try again
            </Button>
          </div>
        ) : users.length === 0 ? (
          <p className="py-16 text-center text-sm text-neutral-400">
            {kind === "followers"
              ? "No followers yet."
              : "Not following anyone yet."}
          </p>
        ) : (
          <>
            <ul>
              {users.map((u) => {
                const isMe = me.data?.username === u.username;
                return (
                  <li
                    key={u.id || u.username}
                    className="flex items-center justify-between gap-3 border-b border-[#181D27] py-3"
                  >
                    <Link
                      href={`/users/${encodeURIComponent(u.username)}`}
                      className="flex min-w-0 items-center gap-3"
                    >
                      <Avatar src={u.avatarUrl} name={u.name} size={48} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{u.name}</p>
                        <p className="truncate text-sm text-neutral-400">
                          {u.username}
                        </p>
                      </div>
                    </Link>

                    {!isMe && (
                      <button
                        type="button"
                        onClick={() =>
                          follow.mutate({
                            username: u.username,
                            enable: !u.isFollowedByMe,
                          })
                        }
                        aria-pressed={Boolean(u.isFollowedByMe)}
                        className={cn(
                          "h-10 w-27.5 shrink-0 rounded-full text-sm font-bold transition-colors",
                          u.isFollowedByMe
                            ? "border border-[#252B37] hover:bg-white/5"
                            : "bg-[#6936F2] hover:bg-[#5b2bd9]",
                        )}
                      >
                        {u.isFollowedByMe ? "Following" : "Follow"}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>

            <div
              ref={sentinelRef}
              className="py-6 text-center text-sm text-neutral-400"
            >
              {isFetchingNextPage ? "Loading more..." : ""}
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
