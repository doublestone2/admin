import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function getDbNotes(targetType: string, targetId: string) {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
  .from("db_notes")
  .select(`
    id,
    target_type,
    target_id,
    content,
    created_by,
    created_by_name,
    created_at,
    updated_at,
    deleted_at
  `)
  .eq("target_type", targetType)
  .eq("target_id", targetId)
  .is("deleted_at", null)
  .order("created_at", { ascending: false })
  .range(0, 49);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}