import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function toNumber(value: unknown) {
  const n = Number(value || 0);
  return Number.isNaN(n) ? 0 : n;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseAdminClient();
    const body = await request.json();

    const payload = {
      case_type: String(body.case_type || "교통사고"),
      client_name: String(body.client_name || ""),
      phone: String(body.phone || ""),
      staff_name: String(body.staff_name || ""),
      contract_date: body.contract_date || null,
      settlement_date: body.settlement_date || null,
      status: String(body.status || "종결"),
      final_settlement_amount: toNumber(body.final_settlement_amount),
      fee_amount: toNumber(body.fee_amount),
      memo: String(body.memo || ""),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("settlements")
      .update(payload)
      .eq("id", params.id);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "정산 수정 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseAdminClient();

    const { error } = await supabase
      .from("settlements")
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq("id", params.id);

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "정산 삭제 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}