import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { DbFile, TargetType } from "@/types";

export async function getDbFiles(targetType: TargetType, targetId: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("db_files")
    .select("*,profiles:uploaded_by(name,email)")
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data || []) as any[]).map((f) => ({ ...f, profiles: Array.isArray(f.profiles) ? f.profiles[0] : f.profiles })) as DbFile[];
}
