import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";
import type { FeedPage, Post } from "@/types/post";
import { fetchFeed, fetchMe, fetchSavedIds, togglePostAction } from "./api";

export const feedKey = ["feed"] as const;
export const savedIdsKey = ["saved-ids"] as const;

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

// Daftar id post yang disimpan user (feed tidak memuat savedByMe)
export function useSavedIds(token: string | null) {
  return useQuery({
    queryKey: savedIdsKey,
    queryFn: () => fetchSavedIds(token!),
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
  qc.setQueryData<Post>(["post", id], (old) => (old ? fn(old) : old));
}

function usePostToggle(token: string | null, kind: "like" | "save") {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, enable }: { id: string; enable: boolean }) =>
      togglePostAction(token!, id, kind, enable),

    onMutate: async ({ id, enable }) => {
      await qc.cancelQueries({ queryKey: feedKey });
      if (kind === "save") await qc.cancelQueries({ queryKey: savedIdsKey });

      const snapshot = qc.getQueriesData<FeedData>({ queryKey: feedKey });
      const prevSaved = qc.getQueryData<string[]>(savedIdsKey);

      if (kind === "like") {
        patchPost(qc, id, (p) => {
          if (p.likedByMe === enable) return p; // idempotent
          return {
            ...p,
            likedByMe: enable,
            likeCount: Math.max(0, p.likeCount + (enable ? 1 : -1)),
          };
        });
      } else {
        qc.setQueryData<string[]>(savedIdsKey, (old) => {
          const set = new Set(old ?? []);
          if (enable) set.add(id);
          else set.delete(id);
          return [...set];
        });
        patchPost(qc, id, (p) => ({ ...p, savedByMe: enable }));
      }

      return { snapshot, prevSaved };
    },

    onError: (_err, _vars, ctx) => {
      ctx?.snapshot.forEach(([key, data]) => qc.setQueryData(key, data));
      if (ctx?.prevSaved) qc.setQueryData(savedIdsKey, ctx.prevSaved);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: feedKey });
      qc.invalidateQueries({ queryKey: ["profile-posts"] });
      qc.invalidateQueries({ queryKey: ["me"] });
      qc.invalidateQueries({ queryKey: ["post"] });
      qc.invalidateQueries({ queryKey: ["my-likes"] });
      qc.invalidateQueries({ queryKey: ["user-posts"] });
      if (kind === "save") qc.invalidateQueries({ queryKey: savedIdsKey });
    },
  });
}

export const useToggleLike = (token: string | null) =>
  usePostToggle(token, "like");
export const useToggleSave = (token: string | null) =>
  usePostToggle(token, "save");
