import Link from "next/link";
import { notFound } from "next/navigation";
import { getBoardFiles, getBoardPost } from "@/lib/data/board";
import { fileSizeLabel } from "@/lib/utils/format";
import { formatKSTDateTime } from "@/lib/utils/date";
import { requireAuth } from "@/lib/auth/get-profile";
import { deleteBoardPostAction, toggleNoticeAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function PostDetail({
  params,
}: {
  params: { id: string };
}) {
  const [post, files, profile] = await Promise.all([
    getBoardPost(params.id),
    getBoardFiles(params.id),
    requireAuth(),
  ]);

  if (!post) notFound();

  const canEdit = profile.role === "ADMIN" || post.author_id === profile.id;

  async function handleDeleteBoardPost(formData: FormData): Promise<void> {
    "use server";
    await deleteBoardPostAction(formData);
  }

  async function handleToggleNotice(formData: FormData): Promise<void> {
    "use server";
    await toggleNoticeAction(formData);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link href="/admin/board" className="text-sm text-blue-400">
          ← 목록으로
        </Link>

        <div className="flex gap-2">
          {canEdit ? (
            <Link
              className="btn btn-secondary"
              href={`/admin/board/${post.id}/edit`}
            >
              게시글 수정
            </Link>
          ) : null}

          {canEdit ? (
            <form action={handleDeleteBoardPost}>
              <input type="hidden" name="id" value={post.id} />
              <button className="btn btn-danger" type="submit">
                삭제
              </button>
            </form>
          ) : null}
        </div>
      </div>

      <article className="card p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="badge bg-slate-700 text-slate-200">
            {post.category}
          </span>

          {post.is_notice ? (
            <span className="badge bg-blue-500/20 text-blue-200">
              공지
            </span>
          ) : null}
        </div>

        <h1 className="text-2xl font-black text-white">{post.title}</h1>

        <p className="mt-2 text-sm text-slate-500">
          {post.profiles?.name || "-"} · {formatKSTDateTime(post.created_at)}
        </p>

        {profile.role === "ADMIN" ? (
          <form action={handleToggleNotice} className="mt-4">
            <input type="hidden" name="id" value={post.id} />

            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                name="is_notice"
                defaultChecked={post.is_notice}
              />
              공지로 상단 고정
            </label>

            <button className="btn btn-secondary mt-2" type="submit">
              공지 설정 저장
            </button>
          </form>
        ) : null}

        <div className="mt-6 whitespace-pre-wrap leading-7 text-slate-100">
          {post.content}
        </div>
      </article>

      <section className="card p-5">
        <h2 className="font-black text-white">첨부파일</h2>

        <div className="mt-3 space-y-2">
          {files.length === 0 ? (
            <p className="text-sm text-slate-500">첨부파일이 없습니다.</p>
          ) : null}

          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between rounded-lg bg-slate-950 p-3"
            >
              <span className="text-sm text-slate-200">
                {file.file_name} · {fileSizeLabel(file.file_size)}
              </span>

              {file.file_url ? (
                <a
                  className="text-sm text-blue-400"
                  href={file.file_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  다운로드
                </a>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}