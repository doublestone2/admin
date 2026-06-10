import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const DEFAULT_BUCKET = "db-files";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseAdminClient();
    const id = String(params.id || "").trim();

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "삭제할 파일 ID가 없습니다." },
        { status: 400 }
      );
    }

    const { data: file, error: selectError } = await supabase
      .from("db_files")
      .select("id,bucket,storage_path,path,file_path")
      .eq("id", id)
      .maybeSingle();

    if (selectError) {
      return NextResponse.json(
        { ok: false, error: selectError.message },
        { status: 500 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { ok: false, error: "파일을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const bucket = file.bucket || DEFAULT_BUCKET;
    const storagePath = file.storage_path || file.path || file.file_path;

    if (storagePath) {
      await supabase.storage.from(bucket).remove([storagePath]);
    }

    const { error: deleteError } = await supabase
      .from("db_files")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return NextResponse.json(
        { ok: false, error: deleteError.message },
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
            : "파일 삭제 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}