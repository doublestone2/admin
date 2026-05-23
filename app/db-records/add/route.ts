import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseAdminClient();
    const body = await request.json();

    const targetType = String(body.targetType || "");
    const targetId = String(body.targetId || "");
    const content = String(body.content || "").trim();

    if (!targetType || !targetId) {
      return NextResponse.json(
        { ok: false, error: "메모 연결 대상 정보가 없습니다." },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        { ok: false, error: "메모 내용을 입력해주세요." },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("db_notes").insert({
      target_type: targetType,
      target_id: targetId,
      content,
    });

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
            : "메모 추가 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}