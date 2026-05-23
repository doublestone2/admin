"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { normalizePassword } from "@/lib/utils/format";

export async function loginAction(formData: FormData) {
  const identifier = String(formData.get("identifier") || "").trim();
  const passwordRaw = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/admin/dashboard");
  if (!identifier || !passwordRaw) return { ok: false, error: "아이디와 비밀번호를 입력해 주세요." };

  let authEmail = identifier;
  if (!identifier.includes("@")) {
    const admin = createSupabaseAdminClient();
    const { data } = await admin
      .from("profiles")
      .select("auth_email,email")
      .eq("login_id", identifier)
      .eq("is_active", true)
      .maybeSingle();
    authEmail = data?.auth_email || data?.email || identifier;
  }

  const supabase = createSupabaseServerClient();
  let { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: passwordRaw });
  if (error && passwordRaw.length < 6) {
    const retry = await supabase.auth.signInWithPassword({ email: authEmail, password: normalizePassword(passwordRaw) });
    error = retry.error;
  }
  if (error) return { ok: false, error: error.message === "Invalid login credentials" ? "아이디 또는 비밀번호가 올바르지 않습니다." : error.message };
  redirect(next);
}
