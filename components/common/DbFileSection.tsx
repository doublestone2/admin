"use client";

import { FormEvent, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  const router = useRouter();
  const pathname = usePathname();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleUpload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const selectedFile = fileInputRef.current?.files?.[0];

    if (!selectedFile) {
      setMsg("파일을 먼저 선택해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("targetType", targetType);
    formData.append("targetId", targetId);
    formData.append("returnPath", pathname);

    startTransition(async () => {
      const result = await uploadDbFileAction(formData);

      if (result.ok) {
        setMsg("파일이 업로드되었습니다.");

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        router.refresh();
      } else {
        setMsg(result.error || "파일 업로드 중 오류가 발생했습니다.");
      }
    });
  }

  function removeFile(fileId: string) {
    if (!confirm("파일을 삭제할까요?")) return;

    const formData = new FormData();
    formData.append("fileId", fileId);
    formData.append("returnPath", pathname);

    startTransition(async () => {
      const result = await deleteDbFileAction(formData);

      if (result.ok) {
        setMsg("파일이 삭제되었습니다.");
        router.refresh();
      } else {
        setMsg(result.error || "파일 삭제 중 오류가 발생했습니다.");
      }
    });
  }

  return (
    <section className="card p-5">
      <h2 className="text-lg font-black text-white">첨부파일</h2>

      <form onSubmit={handleUpload} className="mt-4 flex flex-col gap-3 md:flex-row">
        <input
          ref={fileInputRef}
          type="file"
          name="file"
          accept="*/*"
          className="input"
        />

        <button type="submit" className="btn btn-primary" disabled={pending}>
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