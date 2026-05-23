import Link from "next/link";
import { notFound } from "next/navigation";
import { DbFileSection } from "@/components/common/DbFileSection";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  getLead,
  getLeadNotes,
  getProfilesForSelect,
} from "@/lib/data/leads";
import { getDbFiles } from "@/lib/data/files";
import { formatKSTDateTime } from "@/lib/utils/date";
import {
  upsertLeadNoteAction,
  deleteLeadNoteAction,
  updateLeadAction,
  deleteLeadAction,
} from "../actions";
import { getStaffNameOptions } from "@/lib/data/settings";
import {
  CONTACT_METHODS,
  LEAD_STATUSES,
  LEAD_STATUS_LABEL,
} from "@/lib/utils/constants";
import { requireAuth } from "@/lib/auth/get-profile";

export const dynamic = "force-dynamic";

export default async function LeadDetail({
  params,
}: {
  params: { id: string };
}) {
  const profile = await requireAuth();

  const [lead, notes, files, profiles, staffNames] = await Promise.all([
    getLead(params.id),
    getLeadNotes(params.id),
    getDbFiles("LEAD", params.id),
    getProfilesForSelect(),
    getStaffNameOptions(),
  ]);

  if (!lead) notFound();

  async function handleUpdateLead(formData: FormData): Promise<void> {
    "use server";
    await updateLeadAction(formData);
  }

  async function handleDeleteLead(formData: FormData): Promise<void> {
    "use server";
    await deleteLeadAction(formData);
  }

  async function handleUpsertLeadNote(formData: FormData): Promise<void> {
    "use server";
    await upsertLeadNoteAction(formData);
  }

  async function handleDeleteLeadNote(formData: FormData): Promise<void> {
    "use server";
    await deleteLeadNoteAction(formData);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/leads" className="text-sm text-blue-400">
            목록으로
          </Link>

          <h1 className="mt-2 text-2xl font-black text-white">
            {lead.name}
          </h1>
        </div>

        <StatusBadge status={lead.status} />
      </div>

      <section className="card p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-black text-white">DB 정보</h2>

          {profile.role === "ADMIN" ? (
            <form action={handleDeleteLead}>
              <input type="hidden" name="id" value={lead.id} />
              <button className="btn btn-danger" type="submit">
                삭제
              </button>
            </form>
          ) : null}
        </div>

        <form
          action={handleUpdateLead}
          className="mt-4 grid gap-3 md:grid-cols-2"
        >
          <input type="hidden" name="id" value={lead.id} />

          <input
            className="input"
            name="name"
            defaultValue={lead.name}
            placeholder="이름"
          />

          <input
            className="input"
            name="phone"
            defaultValue={lead.phone}
            placeholder="전화번호"
          />

          <select
            className="input"
            name="contact_method"
            defaultValue={lead.contact_method || ""}
          >
            <option value="">연락방법 선택</option>
            {CONTACT_METHODS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>

          <input
            className="input"
            name="insurance_company"
            defaultValue={lead.insurance_company || ""}
            placeholder="상대 보험사"
          />

          <select className="input" name="status" defaultValue={lead.status}>
            {LEAD_STATUSES.map((value) => (
              <option key={value} value={value}>
                {LEAD_STATUS_LABEL[value]}
              </option>
            ))}
          </select>

          <select
            className="input"
            name="assigned_to"
            defaultValue={lead.assigned_to || ""}
          >
            <option value="">담당자 계정 선택</option>
            {profiles.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>

          <select
            className="input"
            name="manager_name"
            defaultValue={lead.manager_name || ""}
          >
            <option value="">담당자명 선택</option>
            {staffNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <div className="text-sm text-slate-400">
            등록일: {formatKSTDateTime(lead.created_at)}
            <br />
            수정일: {formatKSTDateTime(lead.updated_at)}
          </div>

          <div className="flex justify-end md:col-span-2">
            <button className="btn btn-primary" type="submit">
              정보 저장
            </button>
          </div>
        </form>
      </section>

      <section className="card p-5">
        <h2 className="text-lg font-black text-white">메모 타임라인</h2>

        <form action={handleUpsertLeadNote} className="mt-4 space-y-2">
          <input type="hidden" name="lead_id" value={lead.id} />

          <textarea
            className="input min-h-24"
            name="content"
            placeholder="메모를 입력하세요."
          />

          <button className="btn btn-primary" type="submit">
            메모 추가
          </button>
        </form>

        <div className="mt-4 space-y-3">
          {notes.length === 0 ? (
            <p className="text-sm text-slate-500">
              등록된 메모가 없습니다.
            </p>
          ) : null}

          {notes.map((note) => (
            <div
              key={note.id}
              className="rounded-xl border border-slate-800 bg-slate-950 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="whitespace-pre-wrap text-sm">{note.content}</p>

                <form action={handleDeleteLeadNote}>
                  <input type="hidden" name="note_id" value={note.id} />
                  <input type="hidden" name="lead_id" value={lead.id} />

                  <button
                    className="rounded-lg border border-red-500/40 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10"
                    type="submit"
                  >
                    삭제
                  </button>
                </form>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                {note.profiles?.name || "-"} · 작성{" "}
                {formatKSTDateTime(note.created_at)} · 수정{" "}
                {formatKSTDateTime(note.updated_at)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <DbFileSection targetType="LEAD" targetId={lead.id} files={files} />
    </div>
  );
}