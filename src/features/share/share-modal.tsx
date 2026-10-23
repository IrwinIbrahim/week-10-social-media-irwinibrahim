"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaTelegramPlane,
  FaWhatsapp,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { Link2, Mail, Share2 } from "lucide-react";
import Avatar from "@/components/avatar";
import Icon from "@/components/icon";
import { useFollowList } from "@/features/follows/hooks";
import { showToast } from "@/store/toast-slice";
import type { Post, User } from "@/types/post";

interface ShareModalProps {
  post: Post;
  token: string | null;
  onClose: () => void;
}

export default function ShareModal({ post, token, onClose }: ShareModalProps) {
  const dispatch = useDispatch();
  const friends = useFollowList(token, "following");
  const [sent, setSent] = useState<string[]>([]);

  // Escape hanya menutup modal share (bukan modal komentar di bawahnya)
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey, true);
    };
  }, [onClose]);

  const url = `${window.location.origin}/posts/${post.id}`;
  const text = post.caption.slice(0, 100) || `Post by ${post.author.name}`;
  const enc = encodeURIComponent;

  const copy = async (value: string, message: string) => {
    try {
      await navigator.clipboard.writeText(value);
      dispatch(showToast(message));
    } catch {
      dispatch(showToast("Failed to copy"));
    }
  };

  // ⚠️ Belum ada endpoint kirim pesan di Swagger: pesan disalin ke clipboard
  const sendTo = async (u: User) => {
    await copy(
      `@${u.username} check out this post: ${url}`,
      `Message for ${u.name} copied`,
    );
    setSent((s) => (s.includes(u.username) ? s : [...s, u.username]));
  };

  const nativeShare = async () => {
    try {
      await navigator.share({
        title: `Post by ${post.author.name}`,
        text,
        url,
      });
    } catch {}
  };

  const canNativeShare = typeof navigator.share === "function";

  const targets = [
    {
      name: "WhatsApp",
      Glyph: FaWhatsapp,
      bg: "#25D366",
      href: `https://wa.me/?text=${enc(`${text} ${url}`)}`,
    },
    {
      name: "Telegram",
      Glyph: FaTelegramPlane,
      bg: "#26A5E4",
      href: `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}`,
    },
    {
      name: "X",
      Glyph: FaXTwitter,
      bg: "#14171A",
      href: `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(text)}`,
    },
    {
      name: "Facebook",
      Glyph: FaFacebookF,
      bg: "#1877F2",
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
    },
    {
      name: "LinkedIn",
      Glyph: FaLinkedinIn,
      bg: "#0A66C2",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`,
    },
    {
      name: "Email",
      Glyph: Mail,
      bg: "#6936F2",
      href: `mailto:?subject=${enc(`Post by ${post.author.name}`)}&body=${enc(`${text}\n${url}`)}`,
    },
  ];

  const people = friends.data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Share"
      className="fixed inset-0 z-80 flex items-end justify-center md:items-center"
    >
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      <div className="relative flex max-h-[85vh] w-full flex-col rounded-t-2xl border border-[#181D27] bg-[#0A0D12] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:max-w-110 md:rounded-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold">Share</h2>
          <button type="button" onClick={onClose} aria-label="Close">
            <Icon name="close-button" size={24} className="text-white" />
          </button>
        </div>

        {/* Kirim ke teman */}
        <p className="mt-4 text-sm font-semibold">Send to friends</p>
        <div className="mt-2 max-h-52 overflow-y-auto">
          {friends.isLoading ? (
            <p className="py-4 text-sm text-neutral-400">Loading friends...</p>
          ) : friends.isError ? (
            <p className="py-4 text-sm text-red-500">{friends.error.message}</p>
          ) : people.length === 0 ? (
            <p className="py-4 text-sm text-neutral-400">
              You&apos;re not following anyone yet.
            </p>
          ) : (
            <>
              <ul>
                {people.map((u) => (
                  <li
                    key={u.id || u.username}
                    className="flex items-center justify-between gap-3 py-2"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar src={u.avatarUrl} name={u.name} size={40} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold">{u.name}</p>
                        <p className="truncate text-xs text-neutral-400">
                          {u.username}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => sendTo(u)}
                      className="shrink-0 rounded-full bg-[#6936F2] px-4 py-1.5 text-xs font-bold hover:bg-[#5b2bd9]"
                    >
                      {sent.includes(u.username) ? "Copied" : "Send"}
                    </button>
                  </li>
                ))}
              </ul>
              {friends.hasNextPage && (
                <button
                  type="button"
                  onClick={() => friends.fetchNextPage()}
                  disabled={friends.isFetchingNextPage}
                  className="w-full py-2 text-xs font-semibold text-[#7F51F9]"
                >
                  {friends.isFetchingNextPage ? "Loading..." : "Load more"}
                </button>
              )}
            </>
          )}
        </div>

        {/* Media sosial */}
        <p className="mt-4 text-sm font-semibold">Share via</p>
        <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-4">
          {targets.map(({ name, Glyph, bg, href }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 text-xs"
            >
              <span
                style={{ backgroundColor: bg }}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-white"
              >
                <Glyph size={20} />
              </span>
              {name}
            </a>
          ))}

          <button
            type="button"
            onClick={() => copy(url, "Link Copied")}
            className="flex flex-col items-center gap-1.5 text-xs"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#252B37] bg-[#181D27] text-white">
              <Link2 size={20} />
            </span>
            Copy link
          </button>

          {canNativeShare && (
            <button
              type="button"
              onClick={nativeShare}
              className="flex flex-col items-center gap-1.5 text-xs"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#252B37] bg-[#181D27] text-white">
                <Share2 size={20} />
              </span>
              More
            </button>
          )}
        </div>

        {/* Link */}
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#181D27] bg-black/30 p-2 pl-3">
          <input
            readOnly
            value={url}
            onFocus={(e) => e.currentTarget.select()}
            className="min-w-0 flex-1 bg-transparent text-xs text-neutral-300 outline-none"
          />
          <button
            type="button"
            onClick={() => copy(url, "Link Copied")}
            className="shrink-0 rounded-lg bg-[#6936F2] px-3 py-1.5 text-xs font-bold hover:bg-[#5b2bd9]"
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}
