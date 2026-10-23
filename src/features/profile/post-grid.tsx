"use client";

import { useDispatch } from "react-redux";
import { Trash2, X } from "lucide-react";
import PostGridView, {
  GridSkeleton,
  TileButton,
} from "@/components/post-grid-view";
import { useToggleSave } from "@/features/feed/hooks";
import { useDeletePost } from "@/features/posts/use-delete-post";
import { showToast } from "@/store/toast-slice";
import { useProfilePosts, type ProfileTab } from "./hooks";

export default function PostGrid({
  token,
  tab,
  username,
}: {
  token: string | null;
  tab: ProfileTab;
  username?: string;
}) {
  const dispatch = useDispatch();
  const query = useProfilePosts(token, tab, username);
  const del = useDeletePost(token);
  const unsave = useToggleSave(token);

  if (tab === "gallery" && !username) return <GridSkeleton />;

  return (
    <PostGridView
      query={query}
      emptyText={tab === "gallery" ? "No posts yet." : "No saved posts yet."}
      renderAction={(post) =>
        tab === "gallery" ? (
          <TileButton
            label="Delete post"
            disabled={del.isPending}
            onClick={() => {
              if (!window.confirm("Delete this post? This cannot be undone."))
                return;
              del.mutate(post.id, {
                onSuccess: () => dispatch(showToast("Post Deleted")),
              });
            }}
          >
            <Trash2 size={16} />
          </TileButton>
        ) : (
          <TileButton
            label="Remove from Saved"
            onClick={() =>
              unsave.mutate(
                { id: post.id, enable: false },
                { onSuccess: () => dispatch(showToast("Removed from Saved")) },
              )
            }
          >
            <X size={16} />
          </TileButton>
        )
      }
    />
  );
}
