import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const DEFAULT_BUCKET = "db-files";

function getFileName(file: any) {
  return (
    file.original_file_name ||
    file.display_name ||
    file.original_name ||
    file.file_name ||
    file.filename ||
    file.name ||
    "download"
  );
}

function makeContentDisposition(fileName: string) {
  const fallbackName = fileName.replace(/[^\x20-\x7E]/g, "_");
  const encodedName = encodeURIComponent(fileName);

  return `attachment; filename="${fallbackName}"; filename*=UTF-8''${encodedName}`;
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createSupabaseAdminClient();
  const id = String(params.id || "").trim();

  if (!id) {
    return new Response("파일 ID가 없습니다.", { status: 400 });
  }

  const { data: file, error } = await supabase
    .from("db_files")
    .select(
      `
      id,
      bucket,
      storage_path,
      path,
      file_path,
      original_file_name,
      display_name,
      original_name,
      file_name,
      filename,
      name,
      mime_type,
      content_type
    `
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !file) {
    return new Response("파일을 찾을 수 없습니다.", { status: 404 });
  }

  const bucket = file.bucket || DEFAULT_BUCKET;
  const storagePath = file.storage_path || file.path || file.file_path;

  if (!storagePath) {
    return new Response("파일 경로가 없습니다.", { status: 404 });
  }

  const { data, error: downloadError } = await supabase.storage
    .from(bucket)
    .download(storagePath);

  if (downloadError || !data) {
    return new Response("파일 다운로드에 실패했습니다.", { status: 500 });
  }

  const fileName = getFileName(file);
  const arrayBuffer = await data.arrayBuffer();

  return new Response(arrayBuffer, {
    headers: {
      "Content-Type":
        file.mime_type || file.content_type || "application/octet-stream",
      "Content-Length": String(arrayBuffer.byteLength),
      "Content-Disposition": makeContentDisposition(fileName),
    },
  });
}