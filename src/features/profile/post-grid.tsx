/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useProfilePosts, type ProfileTab } from "./hooks";

function GridSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-1">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="aspect-square animate-pulse rounded-md bg-[#0A0D12]"
        />
      ))}
    </div>
  );
}

export default function PostGrid({
  token,
  tab,
  username,
}: {
  token: string | null;
  tab: ProfileTab;
  username?: string;
}) {
  const query = useProfilePosts(token, tab, username);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = query;

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

  if (query.isLoading || (tab === "gallery" && !username))
    return <GridSkeleton />;

  if (query.isError) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-red-500">
          {query.error instanceof Error
            ? query.error.message
            : "Failed to load posts."}
        </p>
        <Button
          onClick={() => query.refetch()}
          className="mt-4 rounded-full bg-[#6936F2] text-white hover:bg-[#5b2bd9]"
        >
          Try again
        </Button>
      </div>
    );
  }

  const posts = query.data?.pages.flatMap((p) => p.items) ?? [];

  if (posts.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-neutral-400">
        {tab === "gallery" ? "No posts yet." : "No saved posts yet."}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-1">
        {posts.map((post) => (
          <div
            key={post.id}
            className="aspect-square overflow-hidden rounded-md bg-[#0A0D12]"
          >
            {post.imageUrl && (
              <img
                src={post.imageUrl}
                alt={post.caption || "Post"}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            )}
          </div>
        ))}
      </div>

      <div
        ref={sentinelRef}
        className="py-6 text-center text-sm text-neutral-400"
      >
        {isFetchingNextPage ? "Loading more..." : ""}
      </div>
    </>
  );
}
