import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const BUCKET = "db-files";

function getExtension(fileName: string) {
  const lastDotIndex = fileName.lastIndexOf(".");
  if (lastDotIndex === -1) return "";
  return fileName.slice(lastDotIndex);
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseAdminClient();
    const formData = await request.formData();

    const file = formData.get("file");
    const targetType = String(formData.get("targetType") || "");
    const targetId = String(formData.get("targetId") || "");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "파일을 선택해주세요." },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { ok: false, error: "빈 파일은 업로드할 수 없습니다." },
        { status: 400 }
      );
    }

    if (!targetType || !targetId) {
      return NextResponse.json(
        { ok: false, error: "파일 연결 대상 정보가 없습니다." },
        { status: 400 }
      );
    }

    const originalName = file.name || "첨부파일";
    const extension = getExtension(originalName);
    const storagePath = `${targetType}/${targetId}/${Date.now()}-${randomUUID()}${extension}`;

    const contentType = file.type || "application/octet-stream";
    const arrayBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, arrayBuffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { ok: false, error: uploadError.message },
        { status: 500 }
      );
    }

    const { data: publicData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(storagePath);

    const { error: insertError } = await supabase.from("db_files").insert({
      target_type: targetType,
      target_id: targetId,

      entity_type: targetType,
      entity_id: targetId,

      bucket: BUCKET,
      storage_path: storagePath,
      path: storagePath,
      file_path: storagePath,

      name: originalName,
      file_name: originalName,
      filename: originalName,
      original_name: originalName,
      original_file_name: originalName,
      display_name: originalName,

      url: publicData.publicUrl,
      public_url: publicData.publicUrl,
      file_url: publicData.publicUrl,

      mime_type: contentType,
      content_type: contentType,

      size: file.size,
      size_bytes: file.size,
      file_size: file.size,

      uploaded_at: new Date().toISOString(),
    });

    if (insertError) {
      await supabase.storage.from(BUCKET).remove([storagePath]);

      return NextResponse.json(
        { ok: false, error: insertError.message },
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
            : "파일 업로드 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}