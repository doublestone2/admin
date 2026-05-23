"use client";

import { useState, useTransition } from "react";
import { uploadDbFileAction, deleteDbFileAction } from "@/app/admin/files/actions";
import { fileSizeLabel } from "@/lib/utils/format";
import { formatKSTDateTime } from "@/lib/utils/date";

type DbFile = {
  id: string;
  file_name: string;
  file_url?: string | null;
  file_size?: number | null;
  mime_type?: string | null;
  created_at?: string | null;
  profiles?: {
    name?: string | null;
    email?: string | null;
  } | null;
};

type DbFileSectionProps = {
  targetType: "LEAD" | "INSURANCE" | "PARTNER" | "HOSPITAL";
  targetId: string;
  files?: DbFile[];
};

export function DbFileSection({
  targetType,
  targetId,
  files = [],
}: DbFileSectionProps) {
  const [msg, setMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleUpload(formData: FormData) {
    formData.set("target_type", targetType);
    formData.set("target_id", targetId);

    startTransition(async () => {
      const result = await uploadDbFileAction(formData);

      setMsg(
        result.ok
          ? "업로드되었습니다."
          : result.error ?? "업로드에 실패했습니다."
      );
    });
  }

  function handleDelete(fileId: string) {
    const confirmed = window.confirm("파일을 삭제할까요?");
    if (!confirmed) return;

    const formData = new FormData();
    formData.set("id", fileId);
    formData.set("target_type", targetType);
    formData.set("target_id", targetId);

    startTransition(async () => {
      const result = await deleteDbFileAction(formData);

      setMsg(
        result.ok
          ? "삭제되었습니다."
          : result.error ?? "삭제에 실패했습니다."
      );
    });
  }

  return (
    <section className="card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-white">첨부파일</h2>
          <p className="mt-1 text-sm text-slate-500">
            관련 서류, 사진, 계약서 등을 업로드해 공유할 수 있습니다.
          </p>
        </div>
      </div>

      <form action={handleUpload} className="mt-4 flex flex-col gap-3 md:flex-row">
        <input
          className="input flex-1"
          type="file"
          name="file"
          disabled={isPending}
        />

        <button className="btn btn-primary" type="submit" disabled={isPending}>
          {isPending ? "처리 중..." : "업로드"}
        </button>
      </form>

      {msg ? (
        <p className="mt-3 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-300">
          {msg}
        </p>
      ) : null}

      <div className="mt-5 space-y-2">
        {files.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-800 p-5 text-center text-sm text-slate-500">
            업로드된 파일이 없습니다.
          </p>
        ) : null}

        {files.map((file) => (
          <div
            key={file.id}
            className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="font-semibold text-slate-100">{file.file_name}</p>

              <p className="mt-1 text-xs text-slate-500">
                {fileSizeLabel(file.file_size ?? 0)}
                {" · "}
                {file.profiles?.name || "알 수 없음"}
                {" · "}
                {formatKSTDateTime(file.created_at || null)}
              </p>
            </div>

            <div className="flex gap-2">
              {file.file_url ? (
                <a
                  className="btn btn-secondary"
                  href={file.file_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  다운로드
                </a>
              ) : null}

              <button
                className="btn btn-danger"
                type="button"
                disabled={isPending}
                onClick={() => handleDelete(file.id)}
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}