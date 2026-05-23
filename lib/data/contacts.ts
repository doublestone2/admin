import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Hospital, InsuranceContact, PartnerCompany } from "@/types";

export async function getInsuranceContacts(query = "") {
  const supabase = createSupabaseServerClient();

  let q = supabase
    .from("insurance_contacts")
    .select(
      `
      id,
      created_at,
      updated_at,
      insurance_company,
      manager_name,
      position,
      phone,
      memo
    `,
      { count: "exact" }
    )
    .is("deleted_at", null);

  if (query) {
    q = q.or(
      `insurance_company.ilike.%${query}%,manager_name.ilike.%${query}%,phone.ilike.%${query}%`
    );
  }

  const { data, error, count } = await q
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);

  return { rows: (data || []) as unknown as InsuranceContact[], count: count || 0 };
}

export async function getInsuranceContact(id: string) {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("insurance_contacts")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return data as InsuranceContact | null;
}

export async function getPartnerCompanies(query = "") {
  const supabase = createSupabaseServerClient();

  let q = supabase
    .from("partner_companies")
    .select(
      `
      id,
      created_at,
      updated_at,
      name,
      company_name,
      partner_name,
      region,
      phone,
      status,
      contract_status,
      partnership_status,
      manager_name,
      memo
    `,
      { count: "exact" }
    )
    .is("deleted_at", null);

  if (query) {
    q = q.or(
      `company_name.ilike.%${query}%,name.ilike.%${query}%,partner_name.ilike.%${query}%,region.ilike.%${query}%,phone.ilike.%${query}%`
    );
  }

  const { data, error, count } = await q
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);

  return { rows: (data || []) as unknown as PartnerCompany[], count: count || 0 };
}

export async function getPartnerCompany(id: string) {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("partner_companies")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return data as PartnerCompany | null;
}

export async function getHospitals(query = "") {
  const supabase = createSupabaseServerClient();

  let q = supabase
    .from("hospitals")
    .select(
      `
      id,
      created_at,
      updated_at,
      name,
      hospital_name,
      hospital_type,
      region,
      address,
      hospital_address,
      phone,
      hospital_phone,
      status,
      contract_status,
      partnership_status,
      internal_manager_name,
      manager_name,
      memo
    `,
      { count: "exact" }
    )
    .is("deleted_at", null);

  if (query) {
    q = q.or(
      `hospital_name.ilike.%${query}%,name.ilike.%${query}%,region.ilike.%${query}%,phone.ilike.%${query}%,hospital_phone.ilike.%${query}%`
    );
  }

  const { data, error, count } = await q
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);

  return { rows: (data || []) as unknown as Hospital[], count: count || 0 };
}

export async function getHospital(id: string) {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("hospitals")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw new Error(error.message);

  return data as Hospital | null;
}