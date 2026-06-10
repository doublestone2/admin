import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Hospital, InsuranceContact, PartnerCompany } from "@/types";

export const CONTACT_PAGE_SIZE = 15;

type ContactSearchField =
  | "all"
  | "company_name"
  | "region"
  | "phone"
  | "memo"
  | "manager_name";

type ListInput =
  | string
  | {
      query?: string;
      page?: number;
      field?: string;
    };

function normalizeListInput(input: ListInput = "") {
  if (typeof input === "string") {
    return {
      query: input,
      page: 1,
      field: "all",
    };
  }

  return {
    query: String(input.query || "").trim(),
    page: Math.max(1, Number(input.page || 1)),
    field: String(input.field || "all"),
  };
}

function getPageRange(page: number) {
  const safePage = Math.max(1, Number(page || 1));
  const from = (safePage - 1) * CONTACT_PAGE_SIZE;
  const to = from + CONTACT_PAGE_SIZE - 1;

  return {
    page: safePage,
    from,
    to,
  };
}

function getTotalPages(count: number) {
  return Math.max(1, Math.ceil((count || 0) / CONTACT_PAGE_SIZE));
}

function buildInsuranceFilter(query: string, field: string) {
  if (!query) return "";

  if (field === "company_name") {
    return `insurance_company.ilike.%${query}%`;
  }

  if (field === "phone") {
    return `phone.ilike.%${query}%`;
  }

  if (field === "memo") {
    return `memo.ilike.%${query}%`;
  }

  if (field === "manager_name") {
    return `manager_name.ilike.%${query}%`;
  }

  return `insurance_company.ilike.%${query}%,manager_name.ilike.%${query}%,position.ilike.%${query}%,phone.ilike.%${query}%,memo.ilike.%${query}%`;
}

function buildPartnerFilter(query: string, field: string) {
  if (!query) return "";

  if (field === "company_name") {
    return `company_name.ilike.%${query}%,name.ilike.%${query}%,partner_name.ilike.%${query}%`;
  }

  if (field === "region") {
    return `region.ilike.%${query}%`;
  }

  if (field === "phone") {
    return `phone.ilike.%${query}%`;
  }

  if (field === "memo") {
    return `memo.ilike.%${query}%`;
  }

  if (field === "manager_name") {
    return `manager_name.ilike.%${query}%`;
  }

  return `company_name.ilike.%${query}%,name.ilike.%${query}%,partner_name.ilike.%${query}%,region.ilike.%${query}%,phone.ilike.%${query}%,manager_name.ilike.%${query}%,memo.ilike.%${query}%`;
}

function buildHospitalFilter(query: string, field: string) {
  if (!query) return "";

  if (field === "company_name") {
    return `hospital_name.ilike.%${query}%,name.ilike.%${query}%`;
  }

  if (field === "region") {
    return `region.ilike.%${query}%,address.ilike.%${query}%,hospital_address.ilike.%${query}%`;
  }

  if (field === "phone") {
    return `phone.ilike.%${query}%,hospital_phone.ilike.%${query}%`;
  }

  if (field === "memo") {
    return `memo.ilike.%${query}%`;
  }

  if (field === "manager_name") {
    return `manager_name.ilike.%${query}%,internal_manager_name.ilike.%${query}%`;
  }

  return `hospital_name.ilike.%${query}%,name.ilike.%${query}%,region.ilike.%${query}%,address.ilike.%${query}%,hospital_address.ilike.%${query}%,phone.ilike.%${query}%,hospital_phone.ilike.%${query}%,manager_name.ilike.%${query}%,internal_manager_name.ilike.%${query}%,memo.ilike.%${query}%`;
}

export async function getInsuranceContacts(input: ListInput = "") {
  const { query, page, field } = normalizeListInput(input);
  const { from, to } = getPageRange(page);

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
    q = q.or(buildInsuranceFilter(query, field));
  }

  const { data, error, count } = await q
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  const totalCount = count || 0;

  return {
    rows: (data || []) as unknown as InsuranceContact[],
    count: totalCount,
    page,
    pageSize: CONTACT_PAGE_SIZE,
    totalPages: getTotalPages(totalCount),
  };
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

export async function getPartnerCompanies(input: ListInput = "") {
  const { query, page, field } = normalizeListInput(input);
  const { from, to } = getPageRange(page);

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
    q = q.or(buildPartnerFilter(query, field));
  }

  const { data, error, count } = await q
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  const totalCount = count || 0;

  return {
    rows: (data || []) as unknown as PartnerCompany[],
    count: totalCount,
    page,
    pageSize: CONTACT_PAGE_SIZE,
    totalPages: getTotalPages(totalCount),
  };
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

export async function getHospitals(input: ListInput = "") {
  const { query, page, field } = normalizeListInput(input);
  const { from, to } = getPageRange(page);

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
    q = q.or(buildHospitalFilter(query, field));
  }

  const { data, error, count } = await q
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  const totalCount = count || 0;

  return {
    rows: (data || []) as unknown as Hospital[],
    count: totalCount,
    page,
    pageSize: CONTACT_PAGE_SIZE,
    totalPages: getTotalPages(totalCount),
  };
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