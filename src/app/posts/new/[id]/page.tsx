import WithParams from "@/components/with-params";
import PostDetailPage from "@/features/posts/post-detail-page";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <WithParams params={params}>
      {({ id }) => <PostDetailPage id={id} />}
    </WithParams>
  );
}
