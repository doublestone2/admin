"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/get-profile";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { cleanText, normalizePassword, toInternalAuthEmail } from "@/lib/utils/format";

export async function createStaffAction(formData: FormData) {
  await requireAdmin();
  const name = cleanText(formData.get("name"));
  const loginId = cleanText(formData.get("login_id"));
  const password = String(formData.get("password") || "");
  if (!name || !loginId || !password) return { ok: false, error: "이름, 로그인ID, 비밀번호를 입력해 주세요." };
  const authEmail = toInternalAuthEmail(loginId);
  const admin = createSupabaseAdminClient();
  const { data: userData, error: userError } = await admin.auth.admin.createUser({ email: authEmail, password: normalizePassword(password), email_confirm: true });
  if (userError) return { ok: false, error: userError.message };
  const { error } = await admin.from("profiles").insert({
    auth_user_id: userData.user?.id, name, login_id: loginId, auth_email: authEmail, email: authEmail, phone: cleanText(formData.get("phone")) || null, role: cleanText(formData.get("role")) || "STAFF", is_active: true
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/staff"); return { ok: true };
}

export async function updateStaffAction(formData: FormData) {
  await requireAdmin();
  const id = cleanText(formData.get("id"));
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("profiles").update({ role: cleanText(formData.get("role")) || "STAFF", is_active: formData.get("is_active") === "on", updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/staff"); return { ok: true };
}
