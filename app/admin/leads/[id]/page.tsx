import Link from "next/link";
import { notFound } from "next/navigation";
import { DbFileSection } from "@/components/common/DbFileSection";
import { StatusBadge } from "@/components/common/StatusBadge";
import { getLead, getLeadNotes } from "@/lib/data/leads";
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
import type { LeadCategory } from "@/types";

export const dynamic = "force-dynamic";

const CATEGORY_LABEL: Record<LeadCategory, string> = {
  traffic: "교통사고",
  recovery: "개인회생",
  civil: "민사",
  criminal: "형사",
  etc: "기타",
};

const CATEGORY_BACK_HREF: Record<LeadCategory, string> = {
  traffic: "/admin/leads",
  recovery: "/admin/recovery",
  civil: "/admin/civil",
  criminal: "/admin/criminal",
  etc: "/admin/etc",
};

function getCategory(value?: string | null): LeadCategory {
  if (
    value === "traffic" ||
    value === "recovery" ||
    value === "civil" ||
    value === "criminal" ||
    value === "etc"
  ) {
    return value;
  }

  return "traffic";
}

export default async function LeadDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [profile, lead, notes, files, staffNames] = await Promise.all([
    requireAuth(),
    getLead(params.id),
    getLeadNotes(params.id),
    getDbFiles("LEAD", params.id),
    getStaffNameOptions(),
  ]);

  if (!lead) notFound();

  const category = getCategory(lead.category);
  const categoryLabel = CATEGORY_LABEL[category];
  const backHref = CATEGORY_BACK_HREF[category];

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
          <Link href={backHref} className="text-sm text-blue-400">
            ← 목록으로
          </Link>

          <div className="mt-2 flex items-center gap-2">
            <h1 className="text-2xl font-black text-white">{lead.name}</h1>
            <span className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-300">
              {categoryLabel}
            </span>
          </div>
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
          <input type="hidden" name="category" value={category} />

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

          {category === "traffic" ? (
            <>
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
            </>
          ) : null}

          {category === "recovery" ? (
            <>
              <input
                className="input"
                name="debt_amount"
                defaultValue={lead.debt_amount || ""}
                placeholder="채무금액"
              />

              <input
                className="input"
                name="job_income"
                defaultValue={lead.job_income || ""}
                placeholder="직업 / 소득"
              />

              <input
                className="input"
                name="region"
                defaultValue={lead.region || ""}
                placeholder="거주지역"
              />

              <textarea
                className="input min-h-24 md:col-span-2"
                name="case_summary"
                defaultValue={lead.case_summary || ""}
                placeholder="상담 내용"
              />
            </>
          ) : null}

          {category === "civil" ? (
            <>
              <input
                className="input"
                name="case_type"
                defaultValue={lead.case_type || ""}
                placeholder="사건유형"
              />

              <input
                className="input"
                name="claim_amount"
                defaultValue={lead.claim_amount || ""}
                placeholder="청구금액"
              />

              <input
                className="input"
                name="opposing_party"
                defaultValue={lead.opposing_party || ""}
                placeholder="상대방"
              />

              <textarea
                className="input min-h-24 md:col-span-2"
                name="case_summary"
                defaultValue={lead.case_summary || ""}
                placeholder="사건 내용"
              />
            </>
          ) : null}

          {category === "criminal" ? (
            <>
              <input
                className="input"
                name="case_type"
                defaultValue={lead.case_type || ""}
                placeholder="사건유형"
              />

              <select
                className="input"
                name="criminal_position"
                defaultValue={lead.criminal_position || ""}
              >
                <option value="">피의자 / 피해자 선택</option>
                <option value="피의자">피의자</option>
                <option value="피해자">피해자</option>
                <option value="참고인">참고인</option>
                <option value="기타">기타</option>
              </select>

              <select
                className="input"
                name="case_stage"
                defaultValue={lead.case_stage || ""}
              >
                <option value="">진행단계 선택</option>
                <option value="경찰">경찰</option>
                <option value="검찰">검찰</option>
                <option value="법원">법원</option>
                <option value="수사 전">수사 전</option>
                <option value="기타">기타</option>
              </select>

              <input
                className="input"
                name="opposing_party"
                defaultValue={lead.opposing_party || ""}
                placeholder="상대방 / 고소인 / 피고소인"
              />

              <textarea
                className="input min-h-24 md:col-span-2"
                name="case_summary"
                defaultValue={lead.case_summary || ""}
                placeholder="사건 내용"
              />
            </>
          ) : null}

          {category === "etc" ? (
            <>
              <input
                className="input"
                name="case_type"
                defaultValue={lead.case_type || ""}
                placeholder="사건유형"
              />

              <input
                className="input"
                name="region"
                defaultValue={lead.region || ""}
                placeholder="지역"
              />

              <textarea
                className="input min-h-24 md:col-span-2"
                name="case_summary"
                defaultValue={lead.case_summary || ""}
                placeholder="상담 내용"
              />
            </>
          ) : null}

          <select className="input" name="status" defaultValue={lead.status}>
            {LEAD_STATUSES.map((value) => (
              <option key={value} value={value}>
                {LEAD_STATUS_LABEL[value]}
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
            등록일 {formatKSTDateTime(lead.created_at)}
            <br />
            수정일 {formatKSTDateTime(lead.updated_at)}
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
            <p className="text-sm text-slate-500">등록된 메모가 없습니다.</p>
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