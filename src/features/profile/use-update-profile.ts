import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { feedKey } from "@/features/feed/hooks";
import type { EditProfileValues } from "./edit-schema";

export function useUpdateProfile(token: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (v: EditProfileValues) => {
      const fd = new FormData();
      fd.append("name", v.name);
      fd.append("username", v.username);
      fd.append("phone", v.phone);
      fd.append("email", v.email);
      fd.append("bio", v.bio);
      if (v.avatar) fd.append("avatar", v.avatar);
      return apiFetch("/api/me", { method: "PATCH", body: fd, token });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      qc.invalidateQueries({ queryKey: feedKey });
      qc.invalidateQueries({ queryKey: ["profile-posts"] });
    },
  });
}
