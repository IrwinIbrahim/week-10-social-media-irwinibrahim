import { apiFetch } from "@/lib/api";
import { normalizeProfile } from "@/features/feed/api";
import type { Profile } from "@/types/post";

const asRaw = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" ? (v as Record<string, unknown>) : {};

export async function fetchUser(
  token: string,
  username: string,
): Promise<Profile> {
  const res = await apiFetch<unknown>(
    `/api/users/${encodeURIComponent(username)}`,
    { token },
  );
  const root = asRaw(res);
  return normalizeProfile(root.data ?? root);
}

// POST /api/follow/{username} dan DELETE /api/follow/{username} (idempotent)
export function setFollow(token: string, username: string, enable: boolean) {
  return apiFetch(`/api/follow/${encodeURIComponent(username)}`, {
    method: enable ? "POST" : "DELETE",
    token,
  });
}
