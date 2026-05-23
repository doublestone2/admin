import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { getBoardPosts } from "@/lib/data/board";
import { formatKSTDateTime } from "@/lib/utils/date";
import { requireAuth } from "@/lib/auth/get-profile";
import { moveNoticeAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function BoardPage() {
  const [posts, profile] = await Promise.all([
    getBoardPosts(),
    requireAuth(),
  ]);

  async function handleMoveNotice(formData: FormData): Promise<void> {
    "use server";
    await moveNoticeAction(formData);
  }

  return (
    <>
      <PageHeader
        title="자료공유"
        description="교통사고 업무자료와 공지사항"
        action={
          <Link href="/admin/board/new" className="btn btn-primary">
            게시글 작성
          </Link>
        }
      />

      <div className="overflow-hidden rounded-xl border border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="p-3 text-left">구분</th>
              <th className="p-3 text-left">제목</th>
              <th className="p-3 text-left">작성자</th>
              <th className="p-3 text-left">작성일</th>
              {profile.role === "ADMIN" ? (
                <th className="p-3 text-right">공지순서</th>
              ) : null}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {posts.map((post) => (
              <tr key={post.id} className="table-row-clickable">
                <td className="p-3">
                  {post.is_notice ? (
                    <span className="badge bg-blue-500/20 text-blue-200">
                      공지
                    </span>
                  ) : (
                    post.category
                  )}
                </td>

                <td className="p-3 font-bold">
                  <Link href={`/admin/board/${post.id}`} className="block">
                    {post.title}
                  </Link>
                </td>

                <td className="p-3">{post.profiles?.name || "-"}</td>

                <td className="p-3 text-slate-400">
                  {formatKSTDateTime(post.created_at)}
                </td>

                {profile.role === "ADMIN" ? (
                  <td className="p-3 text-right">
                    {post.is_notice ? (
                      <div className="flex justify-end gap-1">
                        <form action={handleMoveNotice}>
                          <input type="hidden" name="id" value={post.id} />
                          <input type="hidden" name="delta" value="-1" />
                          <button className="btn btn-secondary" type="submit">
                            ↑
                          </button>
                        </form>

                        <form action={handleMoveNotice}>
                          <input type="hidden" name="id" value={post.id} />
                          <input type="hidden" name="delta" value="1" />
                          <button className="btn btn-secondary" type="submit">
                            ↓
                          </button>
                        </form>
                      </div>
                    ) : null}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}