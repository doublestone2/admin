import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth/get-profile";
import type { LeadCategory } from "@/types";

export const dynamic = "force-dynamic";

const CATEGORY_VALUES = new Set([
  "traffic",
  "recovery",
  "civil",
  "criminal",
  "etc",
]);

function clean(value: unknown) {
  return String(value || "").trim();
}

function parseMoneyValue(value: unknown) {
  const raw = String(value || "0").replaceAll(",", "").trim();
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function getCategory(value: unknown): LeadCategory {
  const category = clean(value);

  if (CATEGORY_VALUES.has(category)) {
    return category as LeadCategory;
  }

  return "traffic";
}

export async function POST(request: Request) {
  try {
    await requireAuth();

    const body = await request.json();

    const leadId = clean(body.lead_id);

    if (!leadId) {
      return NextResponse.json(
        { ok: false, error: "연결할 DB가 없습니다." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("id,category")
      .eq("id", leadId)
      .is("deleted_at", null)
      .maybeSingle();

    if (leadError) {
      return NextResponse.json(
        { ok: false, error: leadError.message },
        { status: 500 }
      );
    }

    if (!lead) {
      return NextResponse.json(
        { ok: false, error: "DB를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const category = getCategory((lead as any).category || body.category);
    const now = new Date().toISOString();

    const payload = {
      lead_id: leadId,
      category,
      designated_fee_rate: clean(body.designated_fee_rate) || null,
      settlement_amount: parseMoneyValue(body.settlement_amount),
      fee_amount: parseMoneyValue(body.fee_amount),
      primary_manager_id: null,
      primary_manager_name: clean(body.primary_manager_name) || null,
      secondary_manager_id: null,
      secondary_manager_name: clean(body.secondary_manager_name) || null,
      memo: clean(body.memo) || null,
      updated_at: now,
    };

    const { data: existing, error: existingError } = await supabase
      .from("lead_contracts")
      .select("id")
      .eq("lead_id", leadId)
      .is("deleted_at", null)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json(
        { ok: false, error: existingError.message },
        { status: 500 }
      );
    }

    const result = existing?.id
      ? await supabase
          .from("lead_contracts")
          .update(payload)
          .eq("id", existing.id)
      : await supabase.from("lead_contracts").insert({
          ...payload,
          created_at: now,
        });

    if (result.error) {
      return NextResponse.json(
        { ok: false, error: result.error.message },
        { status: 500 }
      );
    }

    await supabase
      .from("leads")
      .update({
        status: "CONTRACTED",
        updated_at: now,
      })
      .eq("id", leadId)
      .is("deleted_at", null);

    revalidatePath("/admin/contracts");
    revalidatePath("/admin/settlements");
    revalidatePath(`/admin/leads/${leadId}`);
    revalidatePath("/admin/leads");
    revalidatePath("/admin/recovery");
    revalidatePath("/admin/civil");
    revalidatePath("/admin/criminal");
    revalidatePath("/admin/etc");

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "계약 저장 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}