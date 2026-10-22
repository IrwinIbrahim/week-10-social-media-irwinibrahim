import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { fetchPostPage } from "@/features/feed/api";
import { feedKey } from "@/features/feed/hooks";
import type { Profile } from "@/types/post";
import { fetchUser, setFollow } from "./api";

export type UserTab = "gallery" | "liked";

export function useUser(token: string | null, username: string) {
  return useQuery({
    queryKey: ["user", username],
    queryFn: () => fetchUser(token!, username),
    enabled: !!token && !!username,
    retry: false,
  });
}

export function useUserPosts(
  token: string | null,
  username: string,
  tab: UserTab,
) {
  const base = `/api/users/${encodeURIComponent(username)}`;
  const path = tab === "liked" ? `${base}/likes` : `${base}/posts`;

  return useInfiniteQuery({
    queryKey: ["user-posts", username, tab],
    queryFn: ({ pageParam }) => fetchPostPage(token!, path, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
    enabled: !!token && !!username,
  });
}

export function useToggleFollow(token: string | null, username: string) {
  const qc = useQueryClient();
  const key = ["user", username];

  return useMutation({
    mutationFn: (enable: boolean) => setFollow(token!, username, enable),

    onMutate: async (enable) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<Profile>(key);

      // Idempotent: counter hanya berubah kalau statusnya memang berubah
      if (prev && Boolean(prev.isFollowedByMe) !== enable) {
        qc.setQueryData<Profile>(key, {
          ...prev,
          isFollowedByMe: enable,
          stats: {
            ...prev.stats,
            followers: Math.max(0, prev.stats.followers + (enable ? 1 : -1)),
          },
        });
      }
      return { prev };
    },

    onError: (_err, _enable, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: key });
      qc.invalidateQueries({ queryKey: ["me"] });
      qc.invalidateQueries({ queryKey: feedKey });
      qc.invalidateQueries({ queryKey: ["user-search"] });
    },
  });
}
