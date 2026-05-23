import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

export async function getCurrentUser() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();
  if (error) return null;
  return data as Profile | null;
}

export async function requireAuth(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  return profile;
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await requireAuth();
  if (profile.role !== "ADMIN") redirect("/admin/dashboard");
  return profile;
}
