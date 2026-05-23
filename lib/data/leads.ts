import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Lead, LeadNoteWithAuthor, Profile } from "@/types";

export type LeadRow = Lead & { profiles?: { name: string; email: string | null } | null; latest_note?: string | null };

function normalizeProfile(row: any) {
  const p = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  return p || null;
}

export async function getLeads({ page = 1, query = "", status = "" }: { page?: number; query?: string; status?: string }) {
  const supabase = createSupabaseServerClient();
  const from = (page - 1) * 20;
  const to = from + 19;
  let q = supabase.from("leads").select("*,profiles:assigned_to(name,email)", { count: "exact" }).is("deleted_at", null);
  if (query) q = q.or(`name.ilike.%${query}%,phone.ilike.%${query}%,insurance_company.ilike.%${query}%`);
  if (status) q = q.eq("status", status);
  const { data, error, count } = await q.order("created_at", { ascending: false }).range(from, to);
  if (error) throw new Error(error.message);
  const rows = ((data || []) as any[]).map((r) => ({ ...r, profiles: normalizeProfile(r) })) as LeadRow[];
  // latest notes in one light query
  const ids = rows.map((r) => r.id);
  if (ids.length) {
    const { data: notes } = await supabase.from("lead_notes").select("lead_id,content,created_at").in("lead_id", ids).is("deleted_at", null).order("created_at", { ascending: false });
    const latest = new Map<string, string>();
    ((notes || []) as any[]).forEach((n) => { if (!latest.has(n.lead_id)) latest.set(n.lead_id, n.content); });
    rows.forEach((r) => r.latest_note = latest.get(r.id) || null);
  }
  return { rows, count: count || 0, page };
}

export async function getLead(id: string): Promise<LeadRow | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("leads").select("*,profiles:assigned_to(name,email)").eq("id", id).is("deleted_at", null).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return { ...(data as any), profiles: normalizeProfile(data) } as LeadRow;
}

export async function getLeadNotes(leadId: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("lead_notes").select("*,profiles:author_id(name,email)").eq("lead_id", leadId).is("deleted_at", null).order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return ((data || []) as any[]).map((n) => ({ ...n, profiles: normalizeProfile(n) || { name: "알 수 없음", email: null } })) as LeadNoteWithAuthor[];
}

export async function getProfilesForSelect(): Promise<Profile[]> {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from("profiles").select("*").eq("is_active", true).order("name");
  return (data || []) as Profile[];
}
