import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { getBoardPosts } from "@/lib/data/board";
import { formatKSTDateTime } from "@/lib/utils/date";
import { requireAuth } from "@/lib/auth/get-profile";
import { moveNoticeAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function BoardPage() {
  const [posts, profile] = await Promise.all([getBoardPosts(), requireAuth()]);
  const isAdmin = profile.role === "ADMIN";

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
              {isAdmin ? (
                <th className="p-3 text-right">공지 순서</th>
              ) : null}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {posts.length === 0 ? (
              <tr>
                <td
                  colSpan={isAdmin ? 5 : 4}
                  className="p-6 text-center text-sm text-slate-500"
                >
                  등록된 게시글이 없습니다.
                </td>
              </tr>
            ) : null}

            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-slate-900/70">
                <td className="p-3">
                  {post.is_notice ? (
                    <span className="badge bg-blue-500/20 text-blue-200">
                      공지
                    </span>
                  ) : (
                    post.category || "일반"
                  )}
                </td>

                <td className="p-3 font-bold">
                  <Link
                    href={`/admin/board/${post.id}`}
                    className="block text-white hover:text-blue-400 hover:underline"
                  >
                    {post.title}
                  </Link>
                </td>

                <td className="p-3">{post.profiles?.name || "-"}</td>

                <td className="p-3 text-slate-400">
                  {formatKSTDateTime(post.created_at)}
                </td>

                {isAdmin ? (
                  <td className="p-3 text-right">
                    {post.is_notice ? (
                      <div className="flex justify-end gap-1">
                        <form action={handleMoveNotice}>
                          <input type="hidden" name="id" value={post.id} />
                          <input type="hidden" name="delta" value="-1" />
                          <button className="btn btn-secondary" type="submit">
                            위
                          </button>
                        </form>

                        <form action={handleMoveNotice}>
                          <input type="hidden" name="id" value={post.id} />
                          <input type="hidden" name="delta" value="1" />
                          <button className="btn btn-secondary" type="submit">
                            아래
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