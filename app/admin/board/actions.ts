"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth/get-profile";
import { cleanText } from "@/lib/utils/format";

function getBoardCategory(formData: FormData) {
  return cleanText(formData.get("category")) || "일반";
}

export async function createBoardPostAction(formData: FormData) {
  const profile = await requireAuth();

  const title = cleanText(formData.get("title"));
  const content = cleanText(formData.get("content"));
  const category = getBoardCategory(formData);
  const isNotice = formData.get("is_notice") === "on";

  if (!title || !content) {
    throw new Error("제목과 본문을 입력해 주세요.");
  }

  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from("board_posts")
    .insert({
      title,
      content,
      category,
      author_id: profile.id,
      is_notice: isNotice,
      pin_order: isNotice ? 999999 : null,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/board");

  redirect(`/admin/board/${data.id}`);
}

export async function updateBoardPostAction(formData: FormData) {
  const profile = await requireAuth();

  const id = cleanText(formData.get("id"));
  const title = cleanText(formData.get("title"));
  const content = cleanText(formData.get("content"));
  const category = getBoardCategory(formData);
  const isNotice = formData.get("is_notice") === "on";

  if (!id) {
    throw new Error("게시글 ID가 없습니다.");
  }

  if (!title || !content) {
    throw new Error("제목과 본문을 입력해 주세요.");
  }

  const admin = createSupabaseAdminClient();

  const { data: post } = await admin
    .from("board_posts")
    .select("author_id")
    .eq("id", id)
    .maybeSingle();

  if (profile.role !== "ADMIN" && post?.author_id !== profile.id) {
    throw new Error("수정 권한이 없습니다.");
  }

  const { error } = await admin
    .from("board_posts")
    .update({
      title,
      content,
      category,
      is_notice: isNotice,
      pin_order: isNotice ? 999999 : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/board");
  revalidatePath(`/admin/board/${id}`);

  redirect(`/admin/board/${id}`);
}

export async function deleteBoardPostAction(formData: FormData) {
  const profile = await requireAuth();

  const id = cleanText(formData.get("id"));

  if (!id) {
    throw new Error("게시글 ID가 없습니다.");
  }

  const admin = createSupabaseAdminClient();

  const { data: post } = await admin
    .from("board_posts")
    .select("author_id")
    .eq("id", id)
    .maybeSingle();

  if (profile.role !== "ADMIN" && post?.author_id !== profile.id) {
    throw new Error("삭제 권한이 없습니다.");
  }

  const { error } = await admin
    .from("board_posts")
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/board");

  redirect("/admin/board");
}

export async function toggleNoticeAction(formData: FormData) {
  const profile = await requireAuth();

  if (profile.role !== "ADMIN") {
    throw new Error("관리자만 공지 설정이 가능합니다.");
  }

  const id = cleanText(formData.get("id"));
  const isNotice = formData.get("is_notice") === "on";

  if (!id) {
    throw new Error("게시글 ID가 없습니다.");
  }

  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from("board_posts")
    .update({
      is_notice: isNotice,
      pin_order: isNotice ? 999999 : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/board");
  revalidatePath(`/admin/board/${id}`);

  return { ok: true };
}

export async function moveNoticeAction(formData: FormData) {
  const profile = await requireAuth();

  if (profile.role !== "ADMIN") {
    throw new Error("권한이 없습니다.");
  }

  const id = cleanText(formData.get("id"));
  const delta = Number(formData.get("delta") || 0);

  if (!id) {
    throw new Error("게시글 ID가 없습니다.");
  }

  const admin = createSupabaseAdminClient();

  const { data: post } = await admin
    .from("board_posts")
    .select("pin_order")
    .eq("id", id)
    .maybeSingle();

  const order = Number(post?.pin_order || 999999) + delta;

  const { error } = await admin
    .from("board_posts")
    .update({
      pin_order: order,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/board");

  return { ok: true };
}