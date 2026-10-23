import WithParams, { safeDecode } from "@/components/with-params";
import FollowListPage from "@/features/follows/follow-list-page";

export default function Page({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  return (
    <WithParams params={params}>
      {({ username }) => (
        <FollowListPage kind="followers" username={safeDecode(username)} />
      )}
    </WithParams>
  );
}
