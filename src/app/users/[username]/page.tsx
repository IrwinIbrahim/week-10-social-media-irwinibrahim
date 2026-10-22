import { Suspense } from "react";
import UserProfilePage from "@/features/users/user-profile-page";

async function UserContent({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  let decoded = username;
  try {
    decoded = decodeURIComponent(username);
  } catch {}

  return <UserProfilePage username={decoded} />;
}

export default function Page({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <UserContent params={params} />
    </Suspense>
  );
}
