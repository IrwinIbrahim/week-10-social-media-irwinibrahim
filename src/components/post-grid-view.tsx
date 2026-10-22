/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef } from "react";
import type {
  InfiniteData,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import type { FeedPage } from "@/types/post";

interface PostGridViewProps {
  query: UseInfiniteQueryResult<InfiniteData<FeedPage>, Error>;
  emptyText: string;
}

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

export default function PostGridView({ query, emptyText }: PostGridViewProps) {
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

  if (query.isLoading) return <GridSkeleton />;

  if (query.isError) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-red-500">{query.error.message}</p>
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
        {emptyText}
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
