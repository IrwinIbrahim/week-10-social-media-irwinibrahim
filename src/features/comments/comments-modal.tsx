/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { Heart } from "lucide-react";
import Avatar from "@/components/avatar";
import Icon from "@/components/icon";
import { useDeletePost } from "@/features/posts/use-delete-post";
import { timeAgo } from "@/lib/time";
import { cn } from "@/lib/utils";
import { showToast } from "@/store/toast-slice";
import type { Post, User } from "@/types/post";
import EmojiPicker from "./emoji-picker";
import { useAddComment, useComments } from "./hooks";

interface CommentsModalProps {
  post: Post;
  token: string | null;
  me?: User;
  onClose: () => void;
  onLike: (post: Post) => void;
  onSave: (post: Post) => void;
}

export default function CommentsModal({
  post,
  token,
  me,
  onClose,
  onLike,
  onSave,
}: CommentsModalProps) {
  const dispatch = useDispatch();
  const comments = useComments(token, post.id);
  const add = useAddComment(token, post.id, me);
  const del = useDeletePost(token);

  const [text, setText] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const emojiWrapRef = useRef<HTMLDivElement>(null);
  const menuWrapRef = useRef<HTMLDivElement>(null);

  // Kunci scroll halaman + tutup dengan Escape
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // Tutup popup emoji / menu saat klik di luar
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (emojiOpen && !emojiWrapRef.current?.contains(t)) setEmojiOpen(false);
      if (menuOpen && !menuWrapRef.current?.contains(t)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [emojiOpen, menuOpen]);

  // Infinite scroll di dalam daftar komentar
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = comments;
  useEffect(() => {
    const el = sentinelRef.current;
    const root = listRef.current;
    if (!el || !root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root, rootMargin: "120px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, comments.data]);

  const items = comments.data?.pages.flatMap((p) => p.items) ?? [];
  const canPost = text.trim().length > 0 && !!token;

  const isOwner =
    !!me &&
    (me.id && post.author.id
      ? me.id === post.author.id
      : me.username === post.author.username);

  const submit = () => {
    const value = text.trim();
    if (!value || !token) return;
    add.mutate(value);
    setText("");
    setEmojiOpen(false);
  };

  const addEmoji = (emoji: string) => {
    const el = inputRef.current;
    const start = el?.selectionStart ?? text.length;
    const end = el?.selectionEnd ?? text.length;
    setText(text.slice(0, start) + emoji + text.slice(end));
    requestAnimationFrame(() => {
      el?.focus();
      const pos = start + emoji.length;
      el?.setSelectionRange(pos, pos);
    });
  };

  const onDelete = () => {
    setMenuOpen(false);
    if (!window.confirm("Delete this post?")) return;
    del.mutate(post.id, {
      onSuccess: () => {
        dispatch(showToast("Post Deleted"));
        onClose();
      },
    });
  };

  const onCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(post.caption);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setMenuOpen(false);
      }, 1200);
    } catch {
      setMenuOpen(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Comments"
      className="fixed inset-0 z-70 md:flex md:items-center md:justify-center"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Tombol close (mobile: di atas sheet) */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 bottom-[calc(64vh+12px)] md:hidden"
      >
        <Icon name="close-button" size={24} className="text-white" />
      </button>

      {/* Panel: bottom sheet (mobile) / modal (desktop) */}
      <div className="absolute inset-x-0 bottom-0 flex h-[64vh] flex-col bg-[#0A0D12] md:relative md:inset-auto md:h-121.5 md:w-202.5 md:max-w-[94vw] md:flex-row">
        {/* Tombol close (desktop: di atas kanan modal) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute -top-10 right-0 hidden md:block"
        >
          <Icon name="close-button" size={24} className="text-white" />
        </button>

        {/* Gambar (desktop) */}
        <div className="hidden bg-black md:block md:h-full md:w-[60%] md:shrink-0">
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt={`Post by ${post.author.username}`}
              className="h-full w-full object-cover"
            />
          )}
        </div>

        {/* Kolom kanan */}
        <div className="flex min-h-0 flex-1 flex-col px-3 pt-5 md:pt-4">
          {/* Penulis (desktop) */}
          <div className="hidden items-start justify-between md:flex">
            <div className="flex items-center gap-3">
              <Avatar
                src={post.author.avatarUrl}
                name={post.author.name}
                size={40}
              />
              <div>
                <p className="text-sm font-bold">{post.author.name}</p>
                <p className="text-xs text-neutral-400">
                  {timeAgo(post.createdAt)}
                </p>
              </div>
            </div>

            <div ref={menuWrapRef} className="relative">
              <button
                type="button"
                aria-label="More options"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex h-8 w-8 items-center justify-center"
              >
                <Icon name="logo-more" size={24} className="text-white" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-9 z-10 w-40 rounded-xl border border-[#252B37] bg-[#0A0D12] p-1 shadow-xl">
                  {isOwner ? (
                    <button
                      type="button"
                      onClick={onDelete}
                      disabled={del.isPending}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-[#D9206B] hover:bg-white/5 disabled:opacity-60"
                    >
                      {del.isPending ? "Deleting..." : "Delete post"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onCopyCaption}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-white/5"
                    >
                      {copied ? "Copied!" : "Copy caption"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Caption (desktop) */}
          <div className="hidden max-h-32 overflow-y-auto border-b border-[#181D27] py-3 md:block">
            <p className="whitespace-pre-line wrap-break-word text-sm leading-6">
              {post.caption}
            </p>
          </div>

          <h2 className="text-base font-bold md:mt-3 md:text-sm">Comments</h2>

          {/* Daftar komentar */}
          <div ref={listRef} className="mt-3 min-h-0 flex-1 overflow-y-auto">
            {comments.isLoading ? (
              <ul>
                {Array.from({ length: 3 }).map((_, i) => (
                  <li
                    key={i}
                    className="animate-pulse border-b border-[#181D27] py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#181D27]" />
                      <div className="space-y-2">
                        <div className="h-3 w-24 rounded bg-[#181D27]" />
                        <div className="h-3 w-16 rounded bg-[#181D27]" />
                      </div>
                    </div>
                    <div className="mt-3 h-3 w-3/4 rounded bg-[#181D27]" />
                  </li>
                ))}
              </ul>
            ) : comments.isError ? (
              <div className="py-8 text-center">
                <p className="text-sm text-red-500">{comments.error.message}</p>
                <button
                  type="button"
                  onClick={() => comments.refetch()}
                  className="mt-3 rounded-full bg-[#6936F2] px-4 py-2 text-sm font-bold hover:bg-[#5b2bd9]"
                >
                  Try again
                </button>
              </div>
            ) : items.length === 0 ? (
              <p className="py-8 text-center text-sm text-neutral-400">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              <>
                <ul>
                  {items.map((c) => (
                    <li
                      key={c.id}
                      className="border-b border-[#181D27] py-3 first:pt-0"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={c.author.avatarUrl}
                          name={c.author.name}
                          size={40}
                        />
                        <div>
                          <p className="text-sm font-bold">{c.author.name}</p>
                          <p className="text-xs text-neutral-400">
                            {timeAgo(c.createdAt)}
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 whitespace-pre-line wrap-break-word text-sm leading-6">
                        {c.text}
                      </p>
                    </li>
                  ))}
                </ul>
                <div
                  ref={sentinelRef}
                  className="py-3 text-center text-xs text-neutral-400"
                >
                  {isFetchingNextPage ? "Loading more..." : ""}
                </div>
              </>
            )}
          </div>

          {/* Aksi (desktop) */}
          <div className="hidden items-center justify-between py-3 md:flex">
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
              <span className="flex items-center gap-1.5 text-sm font-semibold">
                <Icon name="logo-comment" size={24} className="text-white" />
                {post.commentCount}
              </span>
              <span className="flex items-center gap-1.5 text-sm font-semibold">
                <Icon name="logo-share" size={24} className="text-white" />
                {post.shareCount}
              </span>
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

          {add.isError && (
            <p role="alert" className="pb-2 text-sm text-red-500">
              {add.error.message}
            </p>
          )}

          {/* Input komentar */}
          <div
            ref={emojiWrapRef}
            className="relative flex items-center gap-2 pb-4 pt-3 md:pt-0"
          >
            {emojiOpen && <EmojiPicker onPick={addEmoji} />}

            <button
              type="button"
              aria-label="Emoji"
              aria-expanded={emojiOpen}
              onClick={() => setEmojiOpen((v) => !v)}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#181D27] hover:bg-white/5"
            >
              <Icon name="logo-emoji" size={24} className="text-white" />
            </button>

            <div className="flex h-12 flex-1 items-center rounded-xl border border-[#181D27] bg-black/30 pl-4 pr-3 focus-within:border-[#6936F2]">
              <input
                ref={inputRef}
                value={text}
                maxLength={500}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    submit();
                  }
                }}
                placeholder="Add Comment"
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-neutral-500"
              />
              <button
                type="button"
                onClick={submit}
                disabled={!canPost}
                className={cn(
                  "ml-2 text-sm font-bold transition-colors",
                  canPost
                    ? "text-[#7F51F9] hover:text-[#9B7BFF]"
                    : "text-neutral-500",
                )}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
