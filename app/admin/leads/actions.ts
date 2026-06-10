"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { requireAuth, requireAdmin } from "@/lib/auth/get-profile";
import { cleanText } from "@/lib/utils/format";

function getRawText(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

async function syncLeadLatestNote(supabase: any, leadId: string) {
  const { data: latestNote, error: noteError } = await supabase
    .from("lead_notes")
    .select("content,created_at")
    .eq("lead_id", leadId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (noteError) {
    return { ok: false, error: noteError.message };
  }

  const { error: updateError } = await supabase
    .from("leads")
    .update({
      latest_note: latestNote?.content || null,
      latest_note_at: latestNote?.created_at || null,
    })
    .eq("id", leadId)
    .is("deleted_at", null);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  return { ok: true };
}

export async function createLeadAction(formData: FormData) {
  const profile = await requireAuth();

  const name = cleanText(formData.get("name"));
  const phone = getRawText(formData, "phone");

  if (!name || !phone) {
    return { ok: false, error: "이름과 전화번호를 입력해 주세요." };
  }

  const assigned = cleanText(formData.get("assigned_to"));
  const managerName = cleanText(formData.get("manager_name"));
  const memo = cleanText(formData.get("memo"));
  const now = new Date().toISOString();

  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("leads")
    .insert({
      category: cleanText(formData.get("category")) || "traffic",
      name,
      phone,
      contact_method: cleanText(formData.get("contact_method")) || null,
      insurance_company: cleanText(formData.get("insurance_company")) || null,
      status: cleanText(formData.get("status")) || "NEW",
      assigned_to: assigned || null,
      manager_name: managerName || null,
      latest_note: memo || null,
      latest_note_at: memo ? now : null,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  if (memo) {
    const { error: noteError } = await supabase.from("lead_notes").insert({
      lead_id: data.id,
      author_id: profile.id,
      content: memo,
      created_at: now,
    });

    if (noteError) return { ok: false, error: noteError.message };
  }

  revalidatePath("/admin/leads");

  return { ok: true, id: data.id };
}

export async function updateLeadAction(formData: FormData) {
  const profile = await requireAuth();

  const id = cleanText(formData.get("id"));

  if (!id) return { ok: false, error: "ID가 없습니다." };

  const payload: any = {
    name: cleanText(formData.get("name")),
    phone: getRawText(formData, "phone"),
    contact_method: cleanText(formData.get("contact_method")) || null,
    insurance_company: cleanText(formData.get("insurance_company")) || null,
    status: cleanText(formData.get("status")) || "NEW",
    manager_name: cleanText(formData.get("manager_name")) || null,
  };

  if (profile.role === "ADMIN") {
    payload.assigned_to = cleanText(formData.get("assigned_to")) || null;
  }

  const supabase = createSupabaseServerClient();

  const { error } = await supabase
    .from("leads")
    .update(payload)
    .eq("id", id)
    .is("deleted_at", null);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);

  return { ok: true };
}

export async function upsertLeadNoteAction(formData: FormData) {
  const profile = await requireAuth();

  const leadId = cleanText(formData.get("lead_id"));
  const content = cleanText(formData.get("content"));

  if (!leadId || !content) {
    return { ok: false, error: "메모 내용을 입력해 주세요." };
  }

  const supabase = createSupabaseServerClient();
  const noteId = cleanText(formData.get("note_id"));
  const now = new Date().toISOString();

  const result = noteId
    ? await supabase
        .from("lead_notes")
        .update({
          content,
          updated_at: now,
        })
        .eq("id", noteId)
        .eq("lead_id", leadId)
    : await supabase.from("lead_notes").insert({
        lead_id: leadId,
        author_id: profile.id,
        content,
        created_at: now,
      });

  if (result.error) return { ok: false, error: result.error.message };

  const syncResult = await syncLeadLatestNote(supabase, leadId);

  if (!syncResult.ok) {
    return { ok: false, error: syncResult.error };
  }

  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${leadId}`);

  return { ok: true };
}

export async function deleteLeadNoteAction(formData: FormData) {
  await requireAuth();

  const noteId = cleanText(formData.get("note_id"));
  const leadId = cleanText(formData.get("lead_id"));

  if (!noteId || !leadId) {
    return { ok: false, error: "삭제할 메모 정보가 없습니다." };
  }

  const supabase = createSupabaseServerClient();
  const now = new Date().toISOString();

  const { error } = await supabase
    .from("lead_notes")
    .update({
      deleted_at: now,
      updated_at: now,
    })
    .eq("id", noteId)
    .eq("lead_id", leadId);

  if (error) return { ok: false, error: error.message };

  const syncResult = await syncLeadLatestNote(supabase, leadId);

  if (!syncResult.ok) {
    return { ok: false, error: syncResult.error };
  }

  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${leadId}`);

  return { ok: true };
}

export async function deleteLeadAction(formData: FormData) {
  await requireAdmin();

  const id = cleanText(formData.get("id"));

  if (!id) return { ok: false, error: "ID가 없습니다." };

  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from("leads")
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/leads");

  return { ok: true };
}