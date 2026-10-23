import { apiFetch } from "@/lib/api";
import { normalizeUser } from "@/features/feed/api";
import type { User, UsersPage } from "@/types/post";

type Raw = Record<string, unknown>;

const asRaw = (v: unknown): Raw =>
  v && typeof v === "object" ? (v as Raw) : {};

const PAGE_SIZE = 20;

export type FollowKind = "followers" | "following";

export async function fetchFollowPage(
  token: string,
  path: string,
  page: number,
  defaultFollowing = false,
): Promise<UsersPage> {
  const res = await apiFetch<unknown>(
    `${path}?page=${page}&limit=${PAGE_SIZE}`,
    { token },
  );

  const root = asRaw(res);
  const data = asRaw(root.data ?? root);
  const list =
    data.users ?? data.followers ?? data.following ?? data.items ?? root.data;

  const items: User[] = (Array.isArray(list) ? list : []).map((x) => {
    const u = normalizeUser(asRaw(x).user ?? x);
    return { ...u, isFollowedByMe: u.isFollowedByMe ?? defaultFollowing };
  });

  const pagination = asRaw(data.pagination ?? root.pagination);
  const totalPages = Number(pagination.totalPages) || 0;
  const hasNext = totalPages ? page < totalPages : items.length >= PAGE_SIZE;

  return { items, page, hasNext };
}
