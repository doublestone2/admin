import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatKSTDateTime } from "@/lib/utils/date";

export async function getDashboardData() {
  const supabase = createSupabaseServerClient();
  const start = new Date();
  start.setUTCHours(15,0,0,0); // approximate today KST start when UTC date alignment is acceptable for dashboard MVP
  const [all, today, recent, notes, profiles] = await Promise.all([
    supabase.from("leads").select("id,status", { count: "exact" }).is("deleted_at", null),
    supabase.from("leads").select("id", { count: "exact", head: true }).is("deleted_at", null).gte("created_at", start.toISOString()),
    supabase.from("leads").select("id,name,phone,status,created_at,manager_name").is("deleted_at", null).order("created_at", { ascending: false }).limit(10),
    supabase.from("lead_notes").select("id,content,created_at,profiles:author_id(name,email),leads(name)").is("deleted_at", null).order("created_at", { ascending: false }).limit(10),
    supabase.from("profiles").select("id,name").eq("is_active", true)
  ]);
  const rows = (all.data || []) as any[];
  const staff = (profiles.data || []) as any[];
  const byStaff = staff.map(s => ({ name: s.name, count: rows.filter(r => r.assigned_to === s.id).length }));
  return {
    total: all.count || rows.length,
    today: today.count || 0,
    newCount: rows.filter(r=>r.status==="NEW").length,
    inProgress: rows.filter(r=>r.status==="IN_PROGRESS").length,
    contracted: rows.filter(r=>r.status==="CONTRACTED").length,
    closed: rows.filter(r=>r.status==="CLOSED").length,
    recent: (recent.data || []) as any[],
    notes: ((notes.data || []) as any[]).map(n=>({...n, profiles:Array.isArray(n.profiles)?n.profiles[0]:n.profiles, leads:Array.isArray(n.leads)?n.leads[0]:n.leads})),
    byStaff
  };
}
