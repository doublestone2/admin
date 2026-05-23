import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const ALLOWED_TABLES = [
  "partner_companies",
  "hospitals",
  "insurance_contacts",
  "leads",
  "debt_leads",
];

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseAdminClient();
    const body = await request.json();

    const table = String(body.table || "");
    const id = String(body.id || "");
    const values = body.values || {};

    if (!ALLOWED_TABLES.includes(table)) {
      return NextResponse.json(
        { ok: false, error: "허용되지 않은 테이블입니다." },
        { status: 400 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "수정할 DB ID가 없습니다." },
        { status: 400 }
      );
    }

    const updateValues: Record<string, unknown> = {};

    Object.entries(values).forEach(([key, value]) => {
      if (["id", "created_at", "updated_at", "deleted_at"].includes(key)) return;
      updateValues[key] = value === "" ? null : value;
    });

    updateValues.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from(table)
      .update(updateValues)
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "정보 저장 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}