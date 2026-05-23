import { createSupabaseServerClient } from "@/lib/supabase/server";
import { STAFF_NAME_OPTIONS } from "@/lib/utils/constants";

export async function getSettingArray(key: string, fallback: string[] = []) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from("app_settings").select("value").eq("key", key).maybeSingle();
  return Array.isArray(data?.value) ? data.value.map(String) : fallback;
}
export async function getStaffNameOptions() { return getSettingArray("staff_name_options", STAFF_NAME_OPTIONS); }
