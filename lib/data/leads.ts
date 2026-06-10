import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Lead, LeadNoteWithAuthor, Profile } from "@/types";

export const LEAD_PAGE_SIZE = 20;

export type LeadRow = Lead & {
  profiles?: { name: string; email: string | null } | null;
  latest_note?: string | null;
};

type LeadSearchField =
  | "all"
  | "name"
  | "phone"
  | "insurance_company"
  | "manager_name"
  | "memo";

function normalizeProfile(row: any) {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  return profile || null;
}

function normalizeSearchText(value: string) {
  return String(value || "").trim();
}

async function getLeadIdsByMemo(query: string) {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("lead_notes")
    .select("lead_id")
    .ilike("content", `%${query}%`)
    .is("deleted_at", null)
    .limit(500);

  if (error) throw new Error(error.message);

  return Array.from(
    new Set(
      ((data || []) as any[])
        .map((row) => row.lead_id)
        .filter(Boolean)
    )
  );
}

function buildLeadTextFilter(query: string, field: LeadSearchField) {
  if (!query) return "";

  if (field === "name") {
    return `name.ilike.%${query}%`;
  }

  if (field === "phone") {
    return `phone.ilike.%${query}%`;
  }

  if (field === "insurance_company") {
    return `insurance_company.ilike.%${query}%`;
  }

  if (field === "manager_name") {
    return `manager_name.ilike.%${query}%`;
  }

  return `name.ilike.%${query}%,phone.ilike.%${query}%,insurance_company.ilike.%${query}%,manager_name.ilike.%${query}%`;
}

export async function getLeads({
  page = 1,
  query = "",
  status = "",
  field = "all",
}: {
  page?: number;
  query?: string;
  status?: string;
  field?: LeadSearchField | string;
}) {
  const supabase = createSupabaseServerClient();

  const safePage = Math.max(1, Number(page || 1));
  const searchText = normalizeSearchText(query);
  const searchField = (field || "all") as LeadSearchField;

  const from = (safePage - 1) * LEAD_PAGE_SIZE;
  const to = from + LEAD_PAGE_SIZE - 1;

  let memoLeadIds: string[] = [];

  if (searchText && (searchField === "memo" || searchField === "all")) {
    memoLeadIds = await getLeadIdsByMemo(searchText);
  }

  if (searchText && searchField === "memo" && memoLeadIds.length === 0) {
    return {
      rows: [],
      count: 0,
      page: safePage,
      pageSize: LEAD_PAGE_SIZE,
      totalPages: 1,
    };
  }

  let q = supabase
    .from("leads")
    .select(
      `
      id,
      created_at,
      updated_at,
      name,
      phone,
      contact_method,
      insurance_company,
      status,
      assigned_to,
      manager_name,
      profiles:assigned_to(name,email)
    `,
      { count: "planned" }
    )
    .is("deleted_at", null);

  if (searchText) {
    if (searchField === "memo") {
      q = q.in("id", memoLeadIds);
    } else if (searchField === "all" && memoLeadIds.length > 0) {
      const leadFilter = buildLeadTextFilter(searchText, searchField);
      const memoFilter = `id.in.(${memoLeadIds.join(",")})`;

      q = q.or(`${leadFilter},${memoFilter}`);
    } else {
      const leadFilter = buildLeadTextFilter(searchText, searchField);
      q = q.or(leadFilter);
    }
  }

  if (status) {
    q = q.eq("status", status);
  }

  const { data, error, count } = await q
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  const rows = ((data || []) as any[]).map((row) => ({
    ...row,
    profiles: normalizeProfile(row),
    latest_note: null,
  })) as LeadRow[];

  const ids = rows.map((row) => row.id);

  if (ids.length) {
    const { data: notes } = await supabase
      .from("lead_notes")
      .select("id,lead_id,content,created_at")
      .in("lead_id", ids)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(100);

    const latest = new Map<string, string>();

    ((notes || []) as any[]).forEach((note) => {
      if (!latest.has(note.lead_id)) {
        latest.set(note.lead_id, note.content);
      }
    });

    rows.forEach((row) => {
      row.latest_note = latest.get(row.id) || null;
    });
  }

  const totalCount = count || 0;

  return {
    rows,
    count: totalCount,
    page: safePage,
    pageSize: LEAD_PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(totalCount / LEAD_PAGE_SIZE)),
  };
}

export async function getLead(id: string): Promise<LeadRow | null> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("leads")
    .select("*,profiles:assigned_to(name,email)")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw new Error(error.message);

  if (!data) return null;

  return {
    ...(data as any),
    profiles: normalizeProfile(data),
  } as LeadRow;
}

export async function getLeadNotes(leadId: string) {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("lead_notes")
    .select(
      `
      id,
      lead_id,
      author_id,
      content,
      created_at,
      updated_at,
      profiles:author_id(name,email)
    `
    )
    .eq("lead_id", leadId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);

  return ((data || []) as any[]).map((note) => ({
    ...note,
    profiles: normalizeProfile(note) || { name: "알 수 없음", email: null },
  })) as LeadNoteWithAuthor[];
}

export async function getProfilesForSelect(): Promise<Profile[]> {
  const supabase = createSupabaseServerClient();

  const { data } = await supabase
    .from("profiles")
    .select("id,name,email,login_id,role,is_active")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("name");

  return (data || []) as unknown as Profile[];
}