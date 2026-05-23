import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseAdminClient();

    if (!params.id) {
      return NextResponse.json(
        { ok: false, error: "삭제할 직원 ID가 없습니다." },
        { status: 400 }
      );
    }

    await supabase
      .from("profiles")
      .update({
        deleted_at: new Date().toISOString(),
      })
      .eq("id", params.id);

    const { error } = await supabase.auth.admin.deleteUser(params.id);

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
            : "직원계정 삭제 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}