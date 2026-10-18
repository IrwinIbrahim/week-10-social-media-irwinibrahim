"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import PostCard from "./post-card";
import { useFeed, useToggleLike, useToggleSave } from "./hooks";

function PostSkeleton() {
  return (
    <div className="animate-pulse border-b border-[#181D27] py-4">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-full bg-[#0A0D12]" />
        <div className="space-y-2">
          <div className="h-3 w-24 rounded bg-[#0A0D12]" />
          <div className="h-3 w-16 rounded bg-[#0A0D12]" />
        </div>
      </div>
      <div className="mt-3 aspect-square w-full rounded-xl bg-[#0A0D12]" />
    </div>
  );
}

export default function FeedList({ token }: { token: string | null }) {
  const feed = useFeed(token);
  const like = useToggleLike(token);
  const save = useToggleSave(token);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = feed;

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

  if (feed.isLoading) {
    return (
      <>
        <PostSkeleton />
        <PostSkeleton />
      </>
    );
  }

  if (feed.isError) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-red-500">
          {feed.error instanceof Error
            ? feed.error.message
            : "Failed to load feed."}
        </p>
        <Button
          onClick={() => feed.refetch()}
          className="mt-4 rounded-full bg-[#6936F2] text-white hover:bg-[#5b2bd9]"
        >
          Try again
        </Button>
      </div>
    );
  }

  const posts = feed.data?.pages.flatMap((p) => p.items) ?? [];

  if (posts.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-neutral-400">
        No posts yet. Follow people or create your first post!
      </div>
    );
  }

  return (
    <>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLike={(p) => like.mutate({ id: p.id, enable: !p.likedByMe })}
          onSave={(p) => save.mutate({ id: p.id, enable: !p.savedByMe })}
        />
      ))}

      <div
        ref={sentinelRef}
        className="py-6 text-center text-sm text-neutral-400"
      >
        {isFetchingNextPage
          ? "Loading more..."
          : hasNextPage
            ? ""
            : "You're all caught up"}
      </div>
    </>
  );
}
