import type { BoardPost } from "@/types";
import { BOARD_CATEGORIES } from "@/lib/utils/constants";
import { createBoardPostAction, updateBoardPostAction } from "@/app/admin/board/actions";

export function BoardPostForm({ post }: { post?: BoardPost | null }) {
  async function handleSubmit(formData: FormData): Promise<void> {
    "use server";

    if (post) {
      await updateBoardPostAction(formData);
      return;
    }

    await createBoardPostAction(formData);
  }

  return (
    <form action={handleSubmit} className="card grid gap-4 p-5">
      {post ? <input type="hidden" name="id" value={post.id} /> : null}

      <input
        className="input"
        name="title"
        defaultValue={post?.title || ""}
        placeholder="제목"
      />

      <select
        className="input"
        name="category"
        defaultValue={post?.category || "기타"}
      >
        {BOARD_CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <textarea
        className="input min-h-72"
        name="content"
        defaultValue={post?.content || ""}
        placeholder="본문"
      />

      <label className="flex items-center gap-2 text-sm text-slate-300">
        <input
          type="checkbox"
          name="is_notice"
          defaultChecked={Boolean(post?.is_notice)}
        />
        공지로 상단 고정
      </label>

      <div className="flex justify-end">
        <button className="btn btn-primary" type="submit">
          {post ? "수정 저장" : "게시글 작성"}
        </button>
      </div>
    </form>
  );
}