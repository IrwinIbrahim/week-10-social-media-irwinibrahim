import { apiFetch } from "@/lib/api";
import { normalizeUser } from "@/features/feed/api";
import type { User } from "@/types/post";

const asRaw = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" ? (v as Record<string, unknown>) : {};

export async function searchUsers(token: string, q: string): Promise<User[]> {
  const res = await apiFetch<unknown>(
    `/api/users/search?q=${encodeURIComponent(q)}`,
    { token },
  );

  const root = asRaw(res);
  const data = asRaw(root.data ?? root);
  const list = data.users ?? data.items ?? root.data ?? root.users;

  return (Array.isArray(list) ? list : []).map(normalizeUser);
}
