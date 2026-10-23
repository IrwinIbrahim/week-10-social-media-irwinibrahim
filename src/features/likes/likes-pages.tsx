"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart } from "lucide-react";
import AppHeader from "@/components/app-header";
import BottomNav from "@/components/bottom-nav";
import PostGridView, { TileButton } from "@/components/post-grid-view";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { fetchPostPage } from "@/features/feed/api";
import { useMe, useToggleLike } from "@/features/feed/hooks";

// GET /api/me/likes
function useMyLikes(token: string | null) {
  return useInfiniteQuery({
    queryKey: ["my-likes"],
    queryFn: ({ pageParam }) =>
      fetchPostPage(token!, "/api/me/likes", pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
    enabled: !!token,
  });
}

export default function LikesPage() {
  const router = useRouter();
  const { token, ready } = useAuthGuard();
  const me = useMe(token);
  const likes = useMyLikes(token);
  const like = useToggleLike(token);

  if (!ready) return <div className="min-h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-black text-white">
      <AppHeader user={me.data} mobileTitle="My Likes" />

      <main className="mx-auto w-full max-w-140 px-4 pb-32 pt-4 md:px-0 md:pt-8">
        <div className="mb-4 hidden items-center gap-3 md:flex">
          <button type="button" onClick={() => router.back()} aria-label="Back">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">My Likes</h1>
        </div>

        <PostGridView
          query={likes}
          emptyText="You haven't liked any posts yet."
          renderAction={(post) => (
            <TileButton
              label="Unlike"
              onClick={() => like.mutate({ id: post.id, enable: false })}
            >
              <Heart size={16} className="fill-[#D9206B] text-[#D9206B]" />
            </TileButton>
          )}
        />
      </main>

      <BottomNav />
    </div>
  );
}
