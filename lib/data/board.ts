import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { BoardFile, BoardPost } from "@/types";

function norm(row: any) {
  return {
    ...row,
    profiles: Array.isArray(row.profiles) ? row.profiles[0] : row.profiles,
  };
}

export async function getBoardPosts() {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("board_posts")
    .select(
      `
      id,
      title,
      content,
      author_id,
      is_notice,
      pin_order,
      created_at,
      updated_at,
      deleted_at,
      profiles:author_id(name,email)
    `
    )
    .is("deleted_at", null)
    .order("is_notice", { ascending: false })
    .order("pin_order", { ascending: true })
    .order("created_at", { ascending: false })
    .range(0, 99);

  if (error) throw new Error(error.message);

  return ((data || []) as any[]).map(norm) as BoardPost[];
}

export async function getBoardPost(id: string) {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("board_posts")
    .select("*,profiles:author_id(name,email)")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return data ? (norm(data) as BoardPost) : null;
}

export async function getBoardFiles(postId: string) {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("board_files")
    .select(
      `
      id,
      post_id,
      file_name,
      file_url,
      file_path,
      file_size,
      mime_type,
      uploaded_by,
      created_at,
      updated_at,
      deleted_at
    `
    )
    .eq("post_id", postId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data || []) as unknown as BoardFile[];
}