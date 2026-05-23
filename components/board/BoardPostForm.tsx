import { BOARD_CATEGORIES } from "@/lib/utils/constants";
import { createBoardPostAction, updateBoardPostAction } from "@/app/admin/board/actions";
import type { BoardPost } from "@/types";

export function BoardPostForm({ post }: { post?: BoardPost | null }) {
  const action = post ? updateBoardPostAction : createBoardPostAction;
  return <form action={action} className="card grid gap-4 p-5">
    {post && <input type="hidden" name="id" value={post.id}/>}<input className="input" name="title" defaultValue={post?.title||""} placeholder="제목"/>
    <select className="input" name="category" defaultValue={post?.category||"기타"}>{BOARD_CATEGORIES.map(c=><option key={c}>{c}</option>)}</select>
    <textarea className="input min-h-72" name="content" defaultValue={post?.content||""} placeholder="본문"/>
    <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" name="is_notice" defaultChecked={!!post?.is_notice}/> 공지로 상단 고정</label>
    <div className="flex justify-end"><button className="btn btn-primary">저장</button></div>
  </form>
}
