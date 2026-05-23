"use client";
import { useState, useTransition } from "react";
import { deleteDbFileAction, uploadDbFileAction } from "@/app/admin/files/actions";
import { fileSizeLabel } from "@/lib/utils/format";
import { formatKSTDateTime } from "@/lib/utils/date";
import type { DbFile, TargetType } from "@/types";

export function DbFileSection({ targetType, targetId, files }: { targetType: TargetType; targetId: string; files: DbFile[] }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  function upload(formData: FormData) {
    formData.set("target_type", targetType); formData.set("target_id", targetId);
    startTransition(async()=>{ const r = await uploadDbFileAction(formData); setMsg(r.ok ? "업로드되었습니다." : r.error); });
  }
  function del(id: string) {
    if (!confirm("파일을 삭제할까요?")) return;
    const fd = new FormData(); fd.set("id", id);
    startTransition(async()=>{ const r = await deleteDbFileAction(fd); setMsg(r.ok ? "삭제되었습니다." : r.error); });
  }
  return <section className="card p-5">
    <h2 className="text-lg font-black text-white">첨부파일</h2>
    <form action={upload} className="mt-4 flex flex-col gap-2 sm:flex-row">
      <input className="input" type="file" name="file" />
      <button className="btn btn-primary" disabled={pending}>업로드</button>
    </form>
    {msg && <p className="mt-2 text-sm text-slate-300">{msg}</p>}
    <div className="mt-4 divide-y divide-slate-800 rounded-xl border border-slate-800">
      {files.length === 0 && <p className="p-4 text-sm text-slate-500">업로드된 파일이 없습니다.</p>}
      {files.map(f => <div key={f.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-bold text-slate-100">{f.file_name}</p>
          <p className="text-xs text-slate-500">{fileSizeLabel(f.file_size)} · {f.profiles?.name || "알 수 없음"} · {formatKSTDateTime(f.created_at)}</p>
        </div>
        <div className="flex gap-2">
          {f.file_url && <a className="btn btn-secondary" href={f.file_url} target="_blank" rel="noreferrer">다운로드</a>}
          <button type="button" className="btn btn-danger" onClick={()=>del(f.id)}>삭제</button>
        </div>
      </div>)}
    </div>
  </section>
}
