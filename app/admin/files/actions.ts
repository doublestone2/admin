"use server";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/auth/get-profile";
import { ALLOWED_FILE_EXTENSIONS, MAX_FILE_SIZE } from "@/lib/utils/constants";
import { cleanText } from "@/lib/utils/format";
import type { TargetType } from "@/types";

function ext(name: string) { return name.split(".").pop()?.toLowerCase() || ""; }

export async function uploadDbFileAction(formData: FormData) {
  const profile = await requireAuth();
  const targetType = cleanText(formData.get("target_type")) as TargetType;
  const targetId = cleanText(formData.get("target_id"));
  const file = formData.get("file") as File | null;
  if (!targetType || !targetId || !file || file.size === 0) return { ok: false, error: "파일을 선택해 주세요." };
  if (file.size > MAX_FILE_SIZE) return { ok: false, error: "파일은 20MB 이하만 업로드할 수 있습니다." };
  if (!ALLOWED_FILE_EXTENSIONS.includes(ext(file.name))) return { ok: false, error: "허용되지 않는 파일 형식입니다." };
  const admin = createSupabaseAdminClient();
  const path = `${targetType}/${targetId}/${Date.now()}_${file.name}`;
  const { error: uploadError } = await admin.storage.from("db-files").upload(path, file, { upsert: false, contentType: file.type || undefined });
  if (uploadError) return { ok: false, error: uploadError.message };
  const { data: pub } = admin.storage.from("db-files").getPublicUrl(path);
  const { error } = await admin.from("db_files").insert({
    target_type: targetType, target_id: targetId, file_name: file.name, file_path: path, file_url: pub.publicUrl, file_size: file.size, mime_type: file.type || null, uploaded_by: profile.id
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/${targetType === "LEAD" ? "leads" : targetType === "INSURANCE" ? "insurance" : targetType === "PARTNER" ? "partners" : "hospitals"}/${targetId}`);
  return { ok: true };
}

export async function deleteDbFileAction(formData: FormData) {
  const profile = await requireAuth();
  const id = cleanText(formData.get("id"));
  const admin = createSupabaseAdminClient();
  const { data: row } = await admin.from("db_files").select("uploaded_by,target_type,target_id").eq("id", id).maybeSingle();
  if (!row) return { ok: false, error: "파일을 찾을 수 없습니다." };
  if (profile.role !== "ADMIN" && row.uploaded_by !== profile.id) return { ok: false, error: "삭제 권한이 없습니다." };
  const { error } = await admin.from("db_files").update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/${row.target_type === "LEAD" ? "leads" : row.target_type === "INSURANCE" ? "insurance" : row.target_type === "PARTNER" ? "partners" : "hospitals"}/${row.target_id}`);
  return { ok: true };
}
