import { notFound } from "next/navigation";
import { BoardPostForm } from "@/components/board/BoardPostForm";
import { getBoardPost } from "@/lib/data/board";
import { PageHeader } from "@/components/common/PageHeader";
export const dynamic="force-dynamic";
export default async function EditPost({params}:{params:{id:string}}){const post=await getBoardPost(params.id); if(!post)notFound(); return <><PageHeader title="게시글 수정"/><BoardPostForm post={post}/></>}
