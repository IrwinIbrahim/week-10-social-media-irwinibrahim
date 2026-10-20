import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchPostPage } from "@/features/feed/api";

export type ProfileTab = "gallery" | "saved";

export function useProfilePosts(
  token: string | null,
  tab: ProfileTab,
  username?: string,
) {
  // ⚠️ Path gallery diasumsikan, cocokkan dengan grup Users di Swagger
  const path =
    tab === "saved"
      ? "/api/me/saved"
      : `/api/users/${encodeURIComponent(username ?? "")}/posts`;

  return useInfiniteQuery({
    queryKey: ["profile-posts", tab, username],
    queryFn: ({ pageParam }) => fetchPostPage(token!, path, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
    enabled: !!token && (tab === "saved" || !!username),
  });
}
