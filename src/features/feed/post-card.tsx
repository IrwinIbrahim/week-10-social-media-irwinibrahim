/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import Icon from "@/components/icon";
import Avatar from "@/components/avatar";
import { timeAgo } from "@/lib/time";
import { cn } from "@/lib/utils";
import type { Post } from "@/types/post";

interface PostCardProps {
  post: Post;
  onLike: (post: Post) => void;
  onSave: (post: Post) => void;
}

export default function PostCard({ post, onLike, onSave }: PostCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isLong = post.caption.length > 90 || post.caption.includes("\n");

  return (
    <article className="border-b border-[#181D27] py-4">
      {/* Author */}
      <div className="flex items-center gap-3">
        <Avatar src={post.author.avatarUrl} name={post.author.name} size={44} />
        <div>
          <p className="text-sm font-semibold md:text-base">
            {post.author.username}
          </p>
          <p className="text-xs text-neutral-400">{timeAgo(post.createdAt)}</p>
        </div>
      </div>

      {/* Image */}
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt={`Post by ${post.author.username}`}
          loading="lazy"
          className="mt-3 aspect-square w-full rounded-xl object-cover"
        />
      )}

      {/* Actions */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onLike(post)}
            aria-pressed={post.likedByMe}
            aria-label={post.likedByMe ? "Unlike" : "Like"}
            className="flex items-center gap-1.5 text-sm font-semibold"
          >
            {post.likedByMe ? (
              <Heart size={24} className="fill-[#D9206B] text-[#D9206B]" />
            ) : (
              <Icon name="logo-like" size={24} className="text-white" />
            )}
            {post.likeCount}
          </button>

          <button
            type="button"
            aria-label="Comments"
            className="flex items-center gap-1.5 text-sm font-semibold"
          >
            <Icon name="logo-comment" size={24} className="text-white" />
            {post.commentCount}
          </button>

          <button
            type="button"
            aria-label="Share"
            className="flex items-center gap-1.5 text-sm font-semibold"
          >
            <Icon name="logo-share" size={24} className="text-white" />
            {post.shareCount}
          </button>
        </div>

        <button
          type="button"
          onClick={() => onSave(post)}
          aria-pressed={post.savedByMe}
          aria-label={post.savedByMe ? "Unsave" : "Save"}
        >
          <Icon
            name="logo-saved"
            size={24}
            className={post.savedByMe ? "text-white" : "text-neutral-400"}
          />
        </button>
      </div>

      {/* Caption */}
      <div className="mt-3">
        <p className="text-sm font-bold">{post.author.username}</p>
        <p
          className={cn(
            "mt-1 whitespace-pre-line text-sm leading-6",
            !expanded && "line-clamp-2",
          )}
        >
          {post.caption}
        </p>
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-1 text-sm font-semibold text-[#7F51F9]"
          >
            {expanded ? "Show Less" : "Show More"}
          </button>
        )}
      </div>
    </article>
  );
}
