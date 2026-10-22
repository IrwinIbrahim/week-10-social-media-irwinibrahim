import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { feedKey, patchPost } from "@/features/feed/hooks";
import type { Comment, CommentsPage, User } from "@/types/post";
import { fetchComments, postComment } from "./api";

export const commentsKey = (postId: string) => ["comments", postId] as const;

type CommentsData = InfiniteData<CommentsPage>;

export function useComments(token: string | null, postId: string) {
  return useInfiniteQuery({
    queryKey: commentsKey(postId),
    queryFn: ({ pageParam }) => fetchComments(token, postId, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
    enabled: !!postId,
  });
}

export function useAddComment(token: string | null, postId: string, me?: User) {
  const qc = useQueryClient();
  const key = commentsKey(postId);

  return useMutation({
    mutationFn: (text: string) => postComment(token!, postId, text),

    onMutate: async (text) => {
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<CommentsData>(key);

      const temp: Comment = {
        id: `temp-${Date.now()}`,
        text,
        createdAt: new Date().toISOString(),
        author: me ?? { id: "", name: "You", username: "you" },
      };

      qc.setQueryData<CommentsData>(key, (old) =>
        old
          ? {
              ...old,
              pages: old.pages.map((p, i) =>
                i === 0 ? { ...p, items: [temp, ...p.items] } : p,
              ),
            }
          : old,
      );
      patchPost(qc, postId, (p) => ({
        ...p,
        commentCount: p.commentCount + 1,
      }));

      return { prev };
    },

    onError: (_err, _text, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: key });
      qc.invalidateQueries({ queryKey: feedKey });
      qc.invalidateQueries({ queryKey: ["profile-posts"] });
      qc.invalidateQueries({ queryKey: ["user-posts"] });
    },
  });
}
