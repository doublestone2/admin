import { createSupabaseServerClient } from "@/lib/supabase/server";

function normalizeProfile(row: any) {
  const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  return profile || null;
}

function getTodayKSTStartISOString() {
  const now = new Date();
  const kstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);

  const year = kstNow.getUTCFullYear();
  const month = kstNow.getUTCMonth();
  const date = kstNow.getUTCDate();

  const kstStart = new Date(Date.UTC(year, month, date, 0, 0, 0, 0));
  const utcStart = new Date(kstStart.getTime() - 9 * 60 * 60 * 1000);

  return utcStart.toISOString();
}

export async function getDashboardData() {
  const supabase = createSupabaseServerClient();
  const todayStart = getTodayKSTStartISOString();

  const [
    total,
    today,
    newCount,
    inProgress,
    contracted,
    closed,
    recent,
    notes,
  ] = await Promise.all([
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null),

    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null)
      .gte("created_at", todayStart),

    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("status", "NEW")
      .is("deleted_at", null),

    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("status", "IN_PROGRESS")
      .is("deleted_at", null),

    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("status", "CONTRACTED")
      .is("deleted_at", null),

    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("status", "CLOSED")
      .is("deleted_at", null),

    supabase
      .from("leads")
      .select("id,name,phone,status,created_at,manager_name")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(6),

    supabase
      .from("lead_notes")
      .select("id,content,created_at,profiles:author_id(name,email)")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  if (total.error) throw new Error(total.error.message);
  if (today.error) throw new Error(today.error.message);
  if (newCount.error) throw new Error(newCount.error.message);
  if (inProgress.error) throw new Error(inProgress.error.message);
  if (contracted.error) throw new Error(contracted.error.message);
  if (closed.error) throw new Error(closed.error.message);
  if (recent.error) throw new Error(recent.error.message);
  if (notes.error) throw new Error(notes.error.message);

  return {
    total: total.count || 0,
    today: today.count || 0,
    newCount: newCount.count || 0,
    inProgress: inProgress.count || 0,
    contracted: contracted.count || 0,
    closed: closed.count || 0,
    recent: (recent.data || []) as any[],
    notes: ((notes.data || []) as any[]).map((note) => ({
      ...note,
      profiles: normalizeProfile(note),
    })),
    byStaff: [],
  };
}