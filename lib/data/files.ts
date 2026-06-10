import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { DbFile, TargetType } from "@/types";

function normalizeProfile(row: any) {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  return profile || null;
}

export async function getDbFiles(targetType: TargetType, targetId: string) {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("db_files")
    .select(
      `
      id,
      target_type,
      target_id,
      bucket,
      storage_path,
      path,
      file_path,
      name,
      file_name,
      filename,
      original_name,
      original_file_name,
      display_name,
      url,
      public_url,
      file_url,
      mime_type,
      content_type,
      size,
      size_bytes,
      file_size,
      uploaded_by,
      created_at,
      updated_at,
      profiles:uploaded_by(name,email)
    `
    )
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);

  return ((data || []) as any[]).map((file) => ({
    ...file,
    profiles: normalizeProfile(file),
  })) as DbFile[];
}