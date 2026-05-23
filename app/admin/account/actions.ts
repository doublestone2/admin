"use server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/get-profile";
import { normalizePassword } from "@/lib/utils/format";

export async function changePasswordAction(formData: FormData) {
  const profile = await requireAuth();
  const current = String(formData.get("current_password") || "");
  const next = String(formData.get("new_password") || "");
  const confirm = String(formData.get("confirm_password") || "");
  if (!current || !next || !confirm) return { ok: false, error: "모든 비밀번호 칸을 입력해 주세요." };
  if (next !== confirm) return { ok: false, error: "새 비밀번호가 일치하지 않습니다." };
  const supabase = createSupabaseServerClient();
  const authEmail = profile.auth_email || profile.email || "";
  let verify = await supabase.auth.signInWithPassword({ email: authEmail, password: current });
  if (verify.error && current.length < 6) verify = await supabase.auth.signInWithPassword({ email: authEmail, password: normalizePassword(current) });
  if (verify.error) return { ok: false, error: "현재 비밀번호가 올바르지 않습니다." };
  const { error } = await supabase.auth.updateUser({ password: normalizePassword(next) });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
