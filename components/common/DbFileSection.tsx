"use client";

import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";
import {
  deleteDbFileAction,
  uploadDbFileAction,
} from "@/app/admin/files/actions";

type DbFile = {
  id: string;
  name?: string | null;
  file_name?: string | null;
  filename?: string | null;
  original_name?: string | null;
  original_file_name?: string | null;
  display_name?: string | null;
  mime_type?: string | null;
  content_type?: string | null;
  size?: number | null;
  size_bytes?: number | null;
  file_size?: number | null;
  created_at?: string | null;
  uploaded_at?: string | null;
};

function getFileName(file: DbFile) {
  return (
    file.original_file_name ||
    file.display_name ||
    file.original_name ||
    file.file_name ||
    file.filename ||
    file.name ||
    "첨부파일"
  );
}

function getFileSize(file: DbFile) {
  const size = file.file_size || file.size_bytes || file.size;

  if (!size) return "-";

  if (size < 1024) return `${size}B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`;

  return `${(size / 1024 / 1024).toFixed(1)}MB`;
}

export function DbFileSection({
  targetType,
  targetId,
  files,
}: {
  targetType: string;
  targetId: string;
  files: DbFile[];
}) {
  const pathname = usePathname();
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function upload(formData: FormData) {
    formData.set("targetType", targetType);
    formData.set("targetId", targetId);
    formData.set("returnPath", pathname);

    startTransition(async () => {
      const result = await uploadDbFileAction(formData);

      if (result.ok) {
        setMsg("파일이 업로드되었습니다.");
      } else {
        setMsg(result.error || "파일 업로드 중 오류가 발생했습니다.");
      }
    });
  }

  function removeFile(fileId: string) {
    if (!confirm("파일을 삭제할까요?")) return;

    const formData = new FormData();
    formData.set("fileId", fileId);
    formData.set("returnPath", pathname);

    startTransition(async () => {
      const result = await deleteDbFileAction(formData);

      if (result.ok) {
        setMsg("파일이 삭제되었습니다.");
      } else {
        setMsg(result.error || "파일 삭제 중 오류가 발생했습니다.");
      }
    });
  }

  return (
    <section className="card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-black text-white">첨부파일</h2>
      </div>

      <form action={upload} className="mt-4 flex flex-col gap-3 md:flex-row">
        <input
          type="file"
          name="file"
          className="input"
          required
        />

        <button className="btn btn-primary" disabled={pending}>
          {pending ? "처리 중..." : "파일 업로드"}
        </button>
      </form>

      {msg && <p className="mt-3 text-sm text-slate-300">{msg}</p>}

      <div className="mt-5 space-y-2">
        {files.length === 0 ? (
          <p className="rounded-xl bg-slate-950 p-4 text-sm text-slate-400">
            업로드된 파일이 없습니다.
          </p>
        ) : (
          files.map((file) => (
            <div
              key={file.id}
              className="flex flex-col gap-3 rounded-xl bg-slate-950 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="font-semibold text-white">{getFileName(file)}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {file.mime_type || file.content_type || "파일 형식 미확인"} ·{" "}
                  {getFileSize(file)}
                </p>
              </div>

              <div className="flex gap-2">
                <a
                  href={`/api/db-files/${file.id}/download`}
                  className="btn btn-secondary"
                >
                  다운로드
                </a>

                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => removeFile(file.id)}
                  disabled={pending}
                >
                  삭제
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}