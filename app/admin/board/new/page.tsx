import Link from "next/link";
import { BoardPostForm } from "@/components/board/BoardPostForm";
import { PageHeader } from "@/components/common/PageHeader";
export const dynamic="force-dynamic";
export default function NewPost(){return <><PageHeader title="게시글 작성" action={<Link href="/admin/board" className="btn btn-secondary">목록</Link>}/><BoardPostForm/></>}
