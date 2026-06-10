import Link from "next/link";
import { notFound } from "next/navigation";
import { BoardPostForm } from "@/components/board/BoardPostForm";
import { getBoardPost } from "@/lib/data/board";
import { PageHeader } from "@/components/common/PageHeader";

export const dynamic = "force-dynamic";

export default async function EditBoardPostPage({
  params,
}: {
  params: { id: string };
}) {
  const post = await getBoardPost(params.id);

  if (!post) notFound();

  return (
    <>
      <PageHeader
        title="게시글 수정"
        action={
          <Link href={`/admin/board/${post.id}`} className="btn btn-secondary">
            상세로
          </Link>
        }
      />

      <BoardPostForm post={post} />
    </>
  );
}