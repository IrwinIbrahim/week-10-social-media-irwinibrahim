"use client";

import AppHeader from "@/components/app-header";
import BottomNav from "@/components/bottom-nav";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import FeedList from "./feed-list";
import { useMe } from "./hooks";

export default function FeedPage() {
  const { token, ready } = useAuthGuard();
  const me = useMe(token);

  if (!ready) return <div className="min-h-screen bg-black" />;

  return (
    <div className="min-h-screen bg-black text-white">
      <AppHeader user={me.data} />

      <main className="mx-auto w-full max-w-150 px-4 pb-32 md:px-0">
        <FeedList token={token} />
      </main>

      <BottomNav />
    </div>
  );
}
