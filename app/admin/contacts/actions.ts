"use server";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAuth, requireAdmin } from "@/lib/auth/get-profile";
import { cleanText } from "@/lib/utils/format";

type Kind = "insurance" | "partner" | "hospital";
const tableMap: Record<Kind,string> = { insurance: "insurance_contacts", partner: "partner_companies", hospital: "hospitals" };
const pathMap: Record<Kind,string> = { insurance: "/admin/insurance", partner: "/admin/partners", hospital: "/admin/hospitals" };

export async function createContactAction(kind: Kind, formData: FormData) {
  const profile = await requireAuth();
  const supabase = createSupabaseServerClient();
  let payload: any = { created_by: profile.id };
  if (kind === "insurance") payload = { ...payload, insurance_company: cleanText(formData.get("insurance_company")), manager_name: cleanText(formData.get("manager_name")) || null, position: cleanText(formData.get("position")) || null, phone: cleanText(formData.get("phone")) || null, memo: cleanText(formData.get("memo")) || null };
  if (kind === "partner") payload = { ...payload, company_name: cleanText(formData.get("company_name")), region: cleanText(formData.get("region")) || null, phone: cleanText(formData.get("phone")) || null, contract_status: cleanText(formData.get("contract_status")) || "미계약", manager_name: cleanText(formData.get("manager_name")) || null, memo: cleanText(formData.get("memo")) || null };
  if (kind === "hospital") payload = { ...payload, hospital_name: cleanText(formData.get("hospital_name")), region: cleanText(formData.get("region")) || null, hospital_type: cleanText(formData.get("hospital_type")) || null, manager_name: cleanText(formData.get("manager_name")) || null, position: cleanText(formData.get("position")) || null, phone: cleanText(formData.get("phone")) || null, partnership_status: cleanText(formData.get("partnership_status")) || "미접촉", internal_manager_name: cleanText(formData.get("internal_manager_name")) || null, memo: cleanText(formData.get("memo")) || null };
  const main = payload.insurance_company || payload.company_name || payload.hospital_name;
  if (!main) return { ok: false, error: "필수 이름을 입력해 주세요." };
  const { error } = await supabase.from(tableMap[kind]).insert(payload);
  if (error) return { ok: false, error: error.message };
  revalidatePath(pathMap[kind]); return { ok: true };
}

export async function updateContactAction(kind: Kind, formData: FormData) {
  const id = cleanText(formData.get("id"));
  const supabase = createSupabaseServerClient();
  let payload: any = {};
  if (kind === "insurance") payload = { insurance_company: cleanText(formData.get("insurance_company")), manager_name: cleanText(formData.get("manager_name")) || null, position: cleanText(formData.get("position")) || null, phone: cleanText(formData.get("phone")) || null, memo: cleanText(formData.get("memo")) || null };
  if (kind === "partner") payload = { company_name: cleanText(formData.get("company_name")), region: cleanText(formData.get("region")) || null, phone: cleanText(formData.get("phone")) || null, contract_status: cleanText(formData.get("contract_status")) || "미계약", manager_name: cleanText(formData.get("manager_name")) || null, memo: cleanText(formData.get("memo")) || null };
  if (kind === "hospital") payload = { hospital_name: cleanText(formData.get("hospital_name")), region: cleanText(formData.get("region")) || null, hospital_type: cleanText(formData.get("hospital_type")) || null, manager_name: cleanText(formData.get("manager_name")) || null, position: cleanText(formData.get("position")) || null, phone: cleanText(formData.get("phone")) || null, partnership_status: cleanText(formData.get("partnership_status")) || "미접촉", internal_manager_name: cleanText(formData.get("internal_manager_name")) || null, memo: cleanText(formData.get("memo")) || null };
  const { error } = await supabase.from(tableMap[kind]).update(payload).eq("id", id).is("deleted_at", null);
  if (error) return { ok: false, error: error.message };
  revalidatePath(pathMap[kind]); revalidatePath(`${pathMap[kind]}/${id}`); return { ok: true };
}

export async function deleteContactAction(kind: Kind, formData: FormData) {
  await requireAdmin();
  const id = cleanText(formData.get("id"));
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from(tableMap[kind]).update({ deleted_at: new Date().toISOString() }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(pathMap[kind]); return { ok: true };
}
