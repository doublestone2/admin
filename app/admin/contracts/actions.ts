"use server";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cleanText, parseMoney } from "@/lib/utils/format";
import { requireAuth } from "@/lib/auth/get-profile";

export async function upsertContractAction(formData: FormData) {
  await requireAuth();
  const leadId = cleanText(formData.get("lead_id"));
  if (!leadId) return { ok: false, error: "대상 DB가 없습니다." };
  const payload = {
    lead_id: leadId,
    designated_fee_rate: cleanText(formData.get("designated_fee_rate")) || null,
    settlement_amount: parseMoney(formData.get("settlement_amount")),
    fee_amount: parseMoney(formData.get("fee_amount")),
    primary_manager_id: cleanText(formData.get("primary_manager_id")) || null,
    primary_manager_name: cleanText(formData.get("primary_manager_name")) || null,
    secondary_manager_id: cleanText(formData.get("secondary_manager_id")) || null,
    secondary_manager_name: cleanText(formData.get("secondary_manager_name")) || null,
    memo: cleanText(formData.get("memo")) || null,
    updated_at: new Date().toISOString()
  };
  const supabase = createSupabaseServerClient();
  const { data: existing } = await supabase.from("lead_contracts").select("id").eq("lead_id", leadId).is("deleted_at", null).maybeSingle();
  const result = existing?.id ? await supabase.from("lead_contracts").update(payload).eq("id", existing.id) : await supabase.from("lead_contracts").insert(payload);
  if (result.error) return { ok: false, error: result.error.message };
  revalidatePath("/admin/contracts"); revalidatePath("/admin/settlements");
  return { ok: true };
}
