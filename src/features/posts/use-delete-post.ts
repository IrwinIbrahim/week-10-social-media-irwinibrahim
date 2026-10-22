import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { feedKey } from "@/features/feed/hooks";

// DELETE /api/posts/{id}
export function useDeletePost(token: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/posts/${id}`, { method: "DELETE", token }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: feedKey });
      qc.invalidateQueries({ queryKey: ["profile-posts"] });
      qc.invalidateQueries({ queryKey: ["user-posts"] });
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}