import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { feedKey } from "@/features/feed/hooks";
import { setFollow } from "@/features/users/api";
import type { UsersPage } from "@/types/post";
import { fetchFollowPage, type FollowKind } from "./api";

export type { FollowKind };

export function useFollowList(
  token: string | null,
  kind: FollowKind,
  username?: string,
) {
  const path = username
    ? `/api/users/${encodeURIComponent(username)}/${kind}`
    : `/api/me/${kind}`;

  return useInfiniteQuery({
    queryKey: ["follow-list", kind, username ?? "me"],
    queryFn: ({ pageParam }) =>
      fetchFollowPage(
        token!,
        path,
        pageParam,
        !username && kind === "following",
      ),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
    enabled: !!token,
  });
}

type ListData = InfiniteData<UsersPage>;

// Follow / Unfollow idempotent + optimistic
export function useFollowUser(token: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ username, enable }: { username: string; enable: boolean }) =>
      setFollow(token!, username, enable),

    onMutate: async ({ username, enable }) => {
      await qc.cancelQueries({ queryKey: ["follow-list"] });
      const snapshot = qc.getQueriesData<ListData>({
        queryKey: ["follow-list"],
      });

      qc.setQueriesData<ListData>({ queryKey: ["follow-list"] }, (old) =>
        old
          ? {
              ...old,
              pages: old.pages.map((p) => ({
                ...p,
                items: p.items.map((u) =>
                  u.username === username
                    ? { ...u, isFollowedByMe: enable }
                    : u,
                ),
              })),
            }
          : old,
      );

      return { snapshot };
    },

    onError: (_err, _vars, ctx) => {
      ctx?.snapshot.forEach(([key, data]) => qc.setQueryData(key, data));
    },

    // Daftar yang sedang dibuka sengaja tidak di-refetch supaya baris tidak hilang mendadak
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      qc.invalidateQueries({ queryKey: ["user"] });
      qc.invalidateQueries({ queryKey: ["user-search"] });
      qc.invalidateQueries({ queryKey: feedKey });
    },
  });
}
