"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { DbFileSection } from "@/components/common/DbFileSection";
import type { TargetType } from "@/types";

type FieldOption = {
  label: string;
  value: string;
};

type DetailField = {
  name: string;
  label: string;
  type?: "text" | "select" | "textarea";
  options?: FieldOption[];
};

type DbNote = {
  id: string;
  content: string;
  created_at?: string | null;
  updated_at?: string | null;
  created_by_name?: string | null;
};

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
};

function displayValue(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DbDetailEditor({
  title,
  backHref,
  tableName,
  targetType,
  record,
  fields,
  notes,
  files,
}: {
  title: string;
  backHref: string;
  tableName: string;
  targetType: TargetType;
  record: any;
  fields: DetailField[];
  notes: DbNote[];
  files: DbFile[];
}) {
  const router = useRouter();

  const [msg, setMsg] = useState<string | null>(null);
  const [memo, setMemo] = useState("");
  const [pending, setPending] = useState(false);
  const [localNotes, setLocalNotes] = useState<DbNote[]>(notes || []);

  async function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const values: Record<string, string> = {};

    fields.forEach((field) => {
      values[field.name] = String(formData.get(field.name) || "");
    });

    setPending(true);
    setMsg(null);

    const response = await fetch("/api/db-records/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        table: tableName,
        id: record.id,
        values,
      }),
    });

    const result = await response.json();
    setPending(false);

    if (!result.ok) {
      setMsg(result.error || "정보 저장 중 오류가 발생했습니다.");
      return;
    }

    setMsg("정보가 저장되었습니다.");
  }

  async function handleDelete() {
    if (!confirm("정말 삭제할까요?")) return;

    setPending(true);
    setMsg(null);

    const response = await fetch("/api/db-records/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        table: tableName,
        id: record.id,
      }),
    });

    const result = await response.json();
    setPending(false);

    if (!result.ok) {
      setMsg(result.error || "삭제 중 오류가 발생했습니다.");
      return;
    }

    router.push(backHref);
    router.refresh();
  }

  async function handleAddMemo(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const content = memo.trim();

    if (!content) {
      setMsg("메모 내용을 입력해주세요.");
      return;
    }

    setPending(true);
    setMsg(null);

    const response = await fetch("/api/db-notes/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        targetType,
        targetId: record.id,
        content,
      }),
    });

    const result = await response.json();
    setPending(false);

    if (!result.ok) {
      setMsg(result.error || "메모 추가 중 오류가 발생했습니다.");
      return;
    }

    const newNote: DbNote = result.note || {
      id: crypto.randomUUID(),
      content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by_name: "-",
    };

    setLocalNotes((prev) => [newNote, ...prev]);
    setMemo("");
    setMsg("메모가 추가되었습니다.");
  }

  async function handleDeleteMemo(noteId: string) {
    if (!confirm("메모를 삭제할까요?")) return;

    setPending(true);
    setMsg(null);

    const response = await fetch("/api/db-notes/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: noteId,
      }),
    });

    const result = await response.json();
    setPending(false);

    if (!result.ok) {
      setMsg(result.error || "메모 삭제 중 오류가 발생했습니다.");
      return;
    }

    setLocalNotes((prev) => prev.filter((note) => note.id !== noteId));
    setMsg("메모가 삭제되었습니다.");
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href={backHref} className="text-sm text-blue-400">
          ← 목록으로
        </Link>

        <h1 className="mt-2 text-2xl font-black text-white">{title}</h1>
      </div>

      {msg ? (
        <p className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-slate-200">
          {msg}
        </p>
      ) : null}

      <section className="card p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-black text-white">DB 정보</h2>

          <button
            type="button"
            className="btn btn-danger"
            onClick={handleDelete}
            disabled={pending}
          >
            삭제
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 grid gap-3 md:grid-cols-2">
          {fields.map((field) => {
            const defaultValue = displayValue(record[field.name]);

            if (field.type === "textarea") {
              return (
                <textarea
                  key={field.name}
                  className="input min-h-24 md:col-span-2"
                  name={field.name}
                  defaultValue={defaultValue}
                  placeholder={field.label}
                />
              );
            }

            if (field.type === "select") {
              return (
                <select
                  key={field.name}
                  className="input"
                  name={field.name}
                  defaultValue={defaultValue}
                >
                  <option value="">{field.label} 선택</option>
                  {(field.options || []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              );
            }

            return (
              <input
                key={field.name}
                className="input"
                name={field.name}
                defaultValue={defaultValue}
                placeholder={field.label}
              />
            );
          })}

          <div className="text-sm text-slate-400">
            등록일 {formatDate(record.created_at)}
            <br />
            수정일 {formatDate(record.updated_at)}
          </div>

          <div className="flex justify-end md:col-span-2">
            <button className="btn btn-primary" type="submit" disabled={pending}>
              정보 저장
            </button>
          </div>
        </form>
      </section>

      <section className="card p-5">
        <h2 className="text-lg font-black text-white">메모 타임라인</h2>

        <form onSubmit={handleAddMemo} className="mt-4 space-y-2">
          <textarea
            className="input min-h-24"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="메모를 입력하세요."
          />

          <button className="btn btn-primary" type="submit" disabled={pending}>
            메모 추가
          </button>
        </form>

        <div className="mt-4 space-y-3">
          {localNotes.length === 0 ? (
            <p className="text-sm text-slate-500">등록된 메모가 없습니다.</p>
          ) : null}

          {localNotes.map((note) => (
            <div
              key={note.id}
              className="rounded-xl border border-slate-800 bg-slate-950 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="whitespace-pre-wrap text-sm">{note.content}</p>

                  <p className="mt-2 text-xs text-slate-500">
                    {note.created_by_name || "-"} · 작성{" "}
                    {formatDate(note.created_at)}
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-danger shrink-0"
                  onClick={() => handleDeleteMemo(note.id)}
                  disabled={pending}
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <DbFileSection targetType={targetType} targetId={record.id} files={files} />
    </div>
  );
}