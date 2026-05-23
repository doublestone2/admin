import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function toNumber(value: unknown) {
  const raw = String(value || "0").replaceAll(",", "");
  const n = Number(raw);
  return Number.isNaN(n) ? 0 : n;
}

export async function GET(request: Request) {
  try {
    const supabase = createSupabaseAdminClient();
    const { searchParams } = new URL(request.url);

    const start = searchParams.get("start");
    const end = searchParams.get("end");

    let query = supabase
      .from("settlements")
      .select("*")
      .is("deleted_at", null)
      .order("settlement_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (start) query = query.gte("settlement_date", start);
    if (end) query = query.lte("settlement_date", end);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, rows: data || [] });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "정산 조회 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseAdminClient();
    const body = await request.json();

    const payload = {
      case_type: String(body.case_type || "교통사고"),
      client_name: String(body.client_name || ""),
      phone: String(body.phone || ""),
      staff_name: String(body.staff_name || ""),
      contract_date: body.contract_date || null,
      settlement_date: body.settlement_date,
      status: String(body.status || "종결"),
      final_settlement_amount: toNumber(body.final_settlement_amount),
      fee_amount: toNumber(body.fee_amount),
      memo: String(body.memo || ""),
    };

    const { error } = await supabase.from("settlements").insert(payload);

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
            : "정산 등록 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}