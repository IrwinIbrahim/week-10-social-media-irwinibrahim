import { apiFetch } from "@/lib/api";
import type { FeedPage, Post, User } from "@/types/post";

type Raw = Record<string, unknown>;

const asRaw = (v: unknown): Raw =>
  v && typeof v === "object" ? (v as Raw) : {};
const str = (v: unknown): string | undefined =>
  typeof v === "string" ? v : undefined;
const num = (v: unknown): number => {
  if (Array.isArray(v)) return v.length;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export function normalizeUser(raw: unknown): User {
  const r = asRaw(raw);
  return {
    id: String(r.id ?? r._id ?? ""),
    name: str(r.name) ?? str(r.username) ?? "User",
    username: str(r.username) ?? str(r.name) ?? "user",
    avatarUrl: str(r.avatarUrl) ?? str(r.avatar) ?? str(r.profilePicture),
  };
}

export function normalizePost(raw: unknown): Post {
  const r = asRaw(raw);
  return {
    id: String(r.id ?? r._id ?? ""),
    imageUrl: str(r.imageUrl) ?? str(r.image) ?? str(r.media) ?? "",
    caption: str(r.caption) ?? str(r.content) ?? "",
    createdAt: str(r.createdAt) ?? new Date().toISOString(),
    likeCount: num(r.likeCount ?? r.likesCount ?? r.likes),
    commentCount: num(r.commentCount ?? r.commentsCount ?? r.comments),
    shareCount: num(r.shareCount ?? r.sharesCount ?? r.shares),
    likedByMe: Boolean(r.likedByMe ?? r.isLiked ?? r.liked),
    savedByMe: Boolean(r.savedByMe ?? r.isSaved ?? r.saved),
    author: normalizeUser(r.author ?? r.user),
  };
}

const PAGE_SIZE = 10;

// ⚠️ Penyesuaian path dengan Swagger bila berbeda
export async function fetchMe(token: string): Promise<User> {
  const res = await apiFetch<unknown>("/api/me", { token });
  const root = asRaw(res);
  return normalizeUser(root.data ?? root);
}

export async function fetchFeed(
  token: string,
  page: number,
): Promise<FeedPage> {
  const res = await apiFetch<unknown>(
    `/api/feed?page=${page}&limit=${PAGE_SIZE}`,
    { token },
  );

  const root = asRaw(res);
  const data = asRaw(root.data ?? root);
  const list = data.posts ?? data.items ?? data.feed ?? root.data ?? root.posts;
  const items = (Array.isArray(list) ? list : []).map(normalizePost);

  const pagination = asRaw(data.pagination ?? root.pagination);
  const totalPages = num(pagination.totalPages);
  const hasNext = totalPages ? page < totalPages : items.length >= PAGE_SIZE;

  return { items, page, hasNext };
}

export function togglePostAction(
  token: string,
  postId: string,
  kind: "like" | "save",
  enable: boolean,
) {
  return apiFetch(`/api/posts/${postId}/${kind}`, {
    method: enable ? "POST" : "DELETE",
    token,
  });
}
