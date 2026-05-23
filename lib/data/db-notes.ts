import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function getDbNotes(targetType: string, targetId: string) {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("db_notes")
    .select("*")
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}