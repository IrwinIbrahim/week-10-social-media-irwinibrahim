"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import AppHeader from "@/components/app-header";
import BottomNav from "@/components/bottom-nav";
import Avatar from "@/components/avatar";
import Icon from "@/components/icon";
import PostGridView from "@/components/post-grid-view";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { useMe } from "@/features/feed/hooks";
import { showToast } from "@/store/toast-slice";
import { cn } from "@/lib/utils";
import { useToggleFollow, useUser, useUserPosts, type UserTab } from "./hooks";
import ProfileStats from "@/components/profile-stats";

export default function UserProfilePage({ username }: { username: string }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { token, ready } = useAuthGuard();
  const me = useMe(token);
  const user = useUser(token, username);
  const follow = useToggleFollow(token, username);
  const [tab, setTab] = useState<UserTab>("gallery");
  const posts = useUserPosts(token, username, tab);

  const profile = user.data;

  // Membuka profil sendiri -> arahkan ke /profile
  useEffect(() => {
    if (me.data && me.data.username.toLowerCase() === username.toLowerCase()) {
      router.replace("/profile");
    }
  }, [me.data, username, router]);

  if (!ready) return <div className="min-h-screen bg-black" />;

  const isFollowing = Boolean(profile?.isFollowedByMe);

  const onShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      dispatch(showToast("Link Copied"));
    } catch {
      dispatch(showToast("Failed to copy link"));
    }
  };

  const base = `/users/${encodeURIComponent(username)}`;
  const stats = [
    { label: "Post", value: profile?.stats.posts ?? 0 },
    {
      label: "Followers",
      value: profile?.stats.followers ?? 0,
      href: `${base}/followers`,
    },
    {
      label: "Following",
      value: profile?.stats.following ?? 0,
      href: `${base}/following`,
    },
    { label: "Likes", value: profile?.stats.likes ?? 0 },
  ];

  const tabs: { key: UserTab; label: string; icon: string }[] = [
    { key: "gallery", label: "Gallery", icon: "logo-gallery" },
    { key: "liked", label: "Liked", icon: "logo-liked-gray" },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <AppHeader user={me.data} mobileTitle={profile?.name ?? username} />

      <main className="mx-auto w-full max-w-140 px-4 pb-32 pt-4 md:px-0 md:pt-8">
        {user.isError ? (
          <div className="py-20 text-center">
            <p className="text-base font-semibold">User not found</p>
            <p className="mt-2 text-sm text-neutral-400">
              {user.error.message}
            </p>
          </div>
        ) : (
          <>
            {/* Identity + actions */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <Avatar
                  src={profile?.avatarUrl}
                  name={profile?.name ?? username}
                  size={64}
                />
                <div>
                  <p className="text-sm font-bold md:text-base">
                    {profile?.name ?? "..."}
                  </p>
                  <p className="mt-1 text-sm text-neutral-300">
                    {profile?.username ?? username}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => follow.mutate(!isFollowing)}
                  disabled={!profile}
                  aria-pressed={isFollowing}
                  className={cn(
                    "flex h-11 flex-1 items-center justify-center rounded-full text-sm font-bold transition-colors disabled:opacity-60 md:w-25 md:flex-none",
                    isFollowing
                      ? "border border-[#252B37] bg-transparent text-white hover:bg-white/5"
                      : "bg-[#6936F2] text-white hover:bg-[#5b2bd9]",
                  )}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>

                <button
                  type="button"
                  onClick={onShare}
                  aria-label="Share profile"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#252B37] hover:bg-white/5"
                >
                  <Icon name="logo-share" size={20} className="text-white" />
                </button>
              </div>
            </div>

            {follow.isError && (
              <p role="alert" className="mt-3 text-sm text-red-500">
                {follow.error.message}
              </p>
            )}

            {/* Bio */}
            {profile?.bio && (
              <p className="mt-4 whitespace-pre-line text-sm leading-6">
                {profile.bio}
              </p>
            )}

            {/* Stats */}
            <ProfileStats stats={stats} />

            {/* Tabs */}
            <div className="mt-6 grid grid-cols-2 border-b border-[#181D27]">
              {tabs.map((t) => {
                const active = tab === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTab(t.key)}
                    aria-pressed={active}
                    className={cn(
                      "-mb-px flex items-center justify-center gap-2 border-b-2 py-3 text-sm font-semibold transition-colors",
                      active
                        ? "border-white text-white"
                        : "border-transparent text-neutral-400 hover:text-white",
                    )}
                  >
                    <Icon name={t.icon} size={20} />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Grid */}
            <div className="mt-4">
              <PostGridView
                query={posts}
                emptyText={
                  tab === "gallery" ? "No posts yet." : "No liked posts yet."
                }
              />
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
