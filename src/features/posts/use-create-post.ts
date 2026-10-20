import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { feedKey } from "@/features/feed/hooks";
import type { PostValues } from "./schema";

// ⚠️ Cocokkan nama field dengan Swagger (POST /api/posts) bila berbeda
export function useCreatePost(token: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ image, caption }: PostValues) => {
      const fd = new FormData();
      fd.append("image", image);
      fd.append("caption", caption);
      return apiFetch("/api/posts", { method: "POST", body: fd, token });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: feedKey });
      qc.invalidateQueries({ queryKey: ["profile-posts"] });
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
