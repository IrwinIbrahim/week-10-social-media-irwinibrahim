import { useQuery } from "@tanstack/react-query";
import { fetchPost } from "@/features/feed/api";

export function usePost(token: string | null, id: string) {
  return useQuery({
    queryKey: ["post", id],
    queryFn: () => fetchPost(token, id),
    enabled: !!id,
    retry: false,
  });
}
