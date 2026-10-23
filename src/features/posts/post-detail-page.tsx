"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import AppHeader from "@/components/app-header";
import BottomNav from "@/components/bottom-nav";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import PostCard from "@/features/feed/post-card";
import {
  useMe,
  useSavedIds,
  useToggleLike,
  useToggleSave,
} from "@/features/feed/hooks";
import { usePost } from "./hooks";

export default function PostDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { token, ready } = useAuthGuard();
  const me = useMe(token);
  const post = usePost(token, id);
  const savedIds = useSavedIds(token);
  const like = useToggleLike(token);
  const save = useToggleSave(token);

  const view = useMemo(() => {
    if (!post.data) return undefined;
    return savedIds.data
      ? { ...post.data, savedByMe: savedIds.data.includes(post.data.id) }
      : post.data;
  }, [post.data, savedIds.data]);

  if (!ready) return <div className="min-h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-black text-white">
      <AppHeader user={me.data} mobileTitle="Post" />

      <main className="mx-auto w-full max-w-150 px-4 pb-32 pt-4 md:px-0 md:pt-8">
        <div className="mb-2 hidden items-center gap-3 md:flex">
          <button type="button" onClick={() => router.back()} aria-label="Back">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Post</h1>
        </div>

        {post.isLoading ? (
          <div className="mt-4 aspect-square w-full animate-pulse rounded-xl bg-[#0A0D12]" />
        ) : post.isError || !view ? (
          <div className="py-20 text-center">
            <p className="text-base font-semibold">Post not found</p>
            <p className="mt-2 text-sm text-neutral-400">
              {post.error?.message ?? "This post may have been deleted."}
            </p>
          </div>
        ) : (
          <PostCard
            post={view}
            token={token}
            me={me.data}
            onLike={(p) => like.mutate({ id: p.id, enable: !p.likedByMe })}
            onSave={(p) => save.mutate({ id: p.id, enable: !p.savedByMe })}
          />
        )}
      </main>

      <BottomNav />
    </div>
  );
}
