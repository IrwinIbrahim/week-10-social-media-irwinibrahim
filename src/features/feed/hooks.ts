import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";
import type { FeedPage, Post } from "@/types/post";
import { fetchFeed, fetchMe, togglePostAction } from "./api";

export const feedKey = ["feed"] as const;

type FeedData = InfiniteData<FeedPage>;

export function useMe(token: string | null) {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => fetchMe(token!),
    enabled: !!token,
  });
}

export function useFeed(token: string | null) {
  return useInfiniteQuery({
    queryKey: feedKey,
    queryFn: ({ pageParam }) => fetchFeed(token!, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
    enabled: !!token,
  });
}

export function patchPost(qc: QueryClient, id: string, fn: (p: Post) => Post) {
  qc.setQueriesData<FeedData>({ queryKey: feedKey }, (old) =>
    old
      ? {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            items: page.items.map((p) => (p.id === id ? fn(p) : p)),
          })),
        }
      : old,
  );
}

function usePostToggle(token: string | null, kind: "like" | "save") {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, enable }: { id: string; enable: boolean }) =>
      togglePostAction(token!, id, kind, enable),

    onMutate: async ({ id, enable }) => {
      await qc.cancelQueries({ queryKey: feedKey });
      const snapshot = qc.getQueriesData<FeedData>({ queryKey: feedKey });

      patchPost(qc, id, (p) => {
        if (kind === "like") {
          if (p.likedByMe === enable) return p; // idempotent
          return {
            ...p,
            likedByMe: enable,
            likeCount: Math.max(0, p.likeCount + (enable ? 1 : -1)),
          };
        }
        return { ...p, savedByMe: enable };
      });

      return { snapshot };
    },

    onError: (_err, _vars, ctx) => {
      ctx?.snapshot.forEach(([key, data]) => qc.setQueryData(key, data));
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: feedKey });
    },
  });
}

export const useToggleLike = (token: string | null) =>
  usePostToggle(token, "like");
export const useToggleSave = (token: string | null) =>
  usePostToggle(token, "save");
