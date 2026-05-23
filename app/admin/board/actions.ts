"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth/get-profile";
import { cleanText } from "@/lib/utils/format";

export async function createBoardPostAction(formData: FormData) {
  const profile = await requireAuth();
  const title = cleanText(formData.get("title"));
  const content = cleanText(formData.get("content"));
  if (!title || !content) return { ok: false, error: "제목과 본문을 입력해 주세요." };
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("board_posts").insert({
    title, content, category: cleanText(formData.get("category")) || "기타", author_id: profile.id,
    is_notice: formData.get("is_notice") === "on", pin_order: formData.get("is_notice") === "on" ? 999999 : null
  }).select("id").single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/board"); redirect(`/admin/board/${data.id}`);
}

export async function updateBoardPostAction(formData: FormData) {
  const profile = await requireAuth();
  const id = cleanText(formData.get("id"));
  const admin = createSupabaseAdminClient();
  const { data: post } = await admin.from("board_posts").select("author_id").eq("id", id).maybeSingle();
  if (profile.role !== "ADMIN" && post?.author_id !== profile.id) return { ok: false, error: "수정 권한이 없습니다." };
  const isNotice = formData.get("is_notice") === "on";
  const { error } = await admin.from("board_posts").update({
    title: cleanText(formData.get("title")), content: cleanText(formData.get("content")), category: cleanText(formData.get("category")) || "기타", is_notice: isNotice, pin_order: isNotice ? 999999 : null, updated_at: new Date().toISOString()
  }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/board"); revalidatePath(`/admin/board/${id}`); redirect(`/admin/board/${id}`);
}

export async function deleteBoardPostAction(formData: FormData) {
  const profile = await requireAuth();
  const id = cleanText(formData.get("id"));
  const admin = createSupabaseAdminClient();
  const { data: post } = await admin.from("board_posts").select("author_id").eq("id", id).maybeSingle();
  if (profile.role !== "ADMIN" && post?.author_id !== profile.id) return { ok: false, error: "삭제 권한이 없습니다." };
  const { error } = await admin.from("board_posts").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/board"); redirect("/admin/board");
}

export async function toggleNoticeAction(formData: FormData) {
  const profile = await requireAuth();
  if (profile.role !== "ADMIN") return { ok: false, error: "관리자만 공지 설정이 가능합니다." };
  const id = cleanText(formData.get("id")); const isNotice = formData.get("is_notice") === "on";
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("board_posts").update({ is_notice: isNotice, pin_order: isNotice ? 999999 : null }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/board"); revalidatePath(`/admin/board/${id}`); return { ok: true };
}

export async function moveNoticeAction(formData: FormData) {
  const profile = await requireAuth(); if (profile.role !== "ADMIN") return { ok: false, error: "권한이 없습니다." };
  const id = cleanText(formData.get("id")); const delta = Number(formData.get("delta") || 0);
  const admin = createSupabaseAdminClient();
  const { data: post } = await admin.from("board_posts").select("pin_order").eq("id", id).maybeSingle();
  const order = Number(post?.pin_order || 999999) + delta;
  await admin.from("board_posts").update({ pin_order: order }).eq("id", id);
  revalidatePath("/admin/board"); return { ok: true };
}