import { apiFetch } from "@/lib/api";
import { normalizeUser } from "@/features/feed/api";
import type { Comment, CommentsPage } from "@/types/post";

type Raw = Record<string, unknown>;

const asRaw = (v: unknown): Raw =>
  v && typeof v === "object" ? (v as Raw) : {};
const str = (v: unknown): string | undefined =>
  typeof v === "string" ? v : undefined;

const PAGE_SIZE = 20;

export function normalizeComment(raw: unknown): Comment {
  const r = asRaw(raw);
  return {
    id: String(r.id ?? r._id ?? ""),
    text: str(r.text) ?? str(r.content) ?? str(r.comment) ?? "",
    createdAt: str(r.createdAt) ?? new Date().toISOString(),
    author: normalizeUser(r.author ?? r.user),
  };
}

// GET /api/posts/{id}/comments
export async function fetchComments(
  token: string | null,
  postId: string,
  page: number,
): Promise<CommentsPage> {
  const res = await apiFetch<unknown>(
    `/api/posts/${postId}/comments?page=${page}&limit=${PAGE_SIZE}`,
    { token },
  );

  const root = asRaw(res);
  const data = asRaw(root.data ?? root);
  const list = data.comments ?? data.items ?? root.data ?? root.comments;
  const items = (Array.isArray(list) ? list : []).map(normalizeComment);

  const pagination = asRaw(data.pagination ?? root.pagination);
  const totalPages = Number(pagination.totalPages) || 0;
  const hasNext = totalPages ? page < totalPages : items.length >= PAGE_SIZE;

  return { items, page, hasNext };
}

export function postComment(token: string, postId: string, text: string) {
  return apiFetch(`/api/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify({ text }),
    token,
  });
}
