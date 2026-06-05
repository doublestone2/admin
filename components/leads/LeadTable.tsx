"use client";

import { Fragment, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createLeadAction,
  deleteLeadAction,
  upsertLeadNoteAction,
} from "@/app/admin/leads/actions";
import { Modal } from "@/components/common/Modal";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  CONTACT_METHODS,
  LEAD_STATUSES,
  LEAD_STATUS_LABEL,
} from "@/lib/utils/constants";
import { formatKSTDateTime } from "@/lib/utils/date";
import type { LeadRow } from "@/lib/data/leads";
import type { Profile } from "@/types";

type LeadTableProps = {
  rows: LeadRow[];
  profiles: Profile[];
  staffNames: string[];
  role: string;
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
};

export function LeadTable({
  rows,
  profiles,
  staffNames,
  role,
  totalCount = rows.length,
  currentPage = 1,
  pageSize = 20,
}: LeadTableProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [memoId, setMemoId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function getRowNumber(index: number) {
    return totalCount - ((currentPage - 1) * pageSize + index);
  }

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await createLeadAction(formData);

      if (result.ok) {
        setOpen(false);
        setMsg("저장되었습니다.");
        router.refresh();
      } else {
        setMsg(result.error ?? "저장 중 오류가 발생했습니다.");
      }
    });
  }

  function saveMemo(formData: FormData) {
    startTransition(async () => {
      const result = await upsertLeadNoteAction(formData);

      setMsg(
        result.ok
          ? "메모가 저장되었습니다."
          : result.error ?? "메모 저장 중 오류가 발생했습니다."
      );

      if (result.ok) {
        router.refresh();
      }
    });
  }

  function del(id: string) {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    const formData = new FormData();
    formData.set("id", id);

    startTransition(async () => {
      const result = await deleteLeadAction(formData);

      setMsg(
        result.ok
          ? "삭제되었습니다."
          : result.error ?? "삭제 중 오류가 발생했습니다."
      );

      if (result.ok) {
        router.refresh();
      }
    });
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => setOpen(true)}
        >
          추가
        </button>
      </div>

      {msg ? (
        <p className="mb-3 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-300">
          {msg}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="w-16 p-3 text-left">No</th>
              <th className="p-3 text-left">등록일</th>
              <th className="p-3 text-left">이름</th>
              <th className="p-3 text-left">전화번호</th>
              <th className="p-3 text-left">연락방법</th>
              <th className="p-3 text-left">상대 보험사</th>
              <th className="p-3 text-left">현황</th>
              <th className="p-3 text-left">담당자</th>
              <th className="p-3 text-left">최근 메모</th>
              <th className="p-3 text-right">액션</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="p-6 text-center text-sm text-slate-500"
                >
                  등록된 DB가 없습니다.
                </td>
              </tr>
            ) : null}

            {rows.map((row, index) => (
              <Fragment key={row.id}>
                <tr
                  className="table-row-clickable cursor-pointer hover:bg-slate-900/70"
                  onClick={() => router.push(`/admin/leads/${row.id}`)}
                >
                  <td className="p-3 font-semibold text-slate-300">
                    {getRowNumber(index)}
                  </td>

                  <td className="p-3 text-slate-400">
                    {formatKSTDateTime(row.created_at)}
                  </td>

                  <td className="p-3 font-bold text-white">{row.name}</td>

                  <td className="p-3">{row.phone}</td>

                  <td className="p-3">{row.contact_method || "-"}</td>

                  <td className="p-3">{row.insurance_company || "-"}</td>

                  <td className="p-3">
                    <StatusBadge status={row.status} />
                  </td>

                  <td className="p-3">
                    {row.manager_name || row.profiles?.name || "-"}
                  </td>

                  <td className="max-w-xs truncate p-3 text-slate-400">
                    {row.latest_note || "-"}
                  </td>

                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setMemoId(memoId === row.id ? null : row.id);
                      }}
                      className="btn btn-secondary mr-2"
                    >
                      메모
                    </button>

                    {role === "ADMIN" ? (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          del(row.id);
                        }}
                        className="btn btn-danger"
                      >
                        삭제
                      </button>
                    ) : null}
                  </td>
                </tr>

                {memoId === row.id ? (
                  <tr>
                    <td colSpan={10} className="bg-slate-950 p-4">
                      <form action={saveMemo} className="space-y-2">
                        <input type="hidden" name="lead_id" value={row.id} />

                        <textarea
                          className="input min-h-24"
                          name="content"
                          defaultValue={row.latest_note || ""}
                        />

                        <button
                          className="btn btn-primary"
                          type="submit"
                          disabled={pending}
                        >
                          메모 저장
                        </button>
                      </form>
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="교통사고 DB 추가">
        <form action={submit} className="grid gap-3">
          <input className="input" name="name" placeholder="이름" />

          <input className="input" name="phone" placeholder="전화번호" />

          <select className="input" name="contact_method">
            {CONTACT_METHODS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>

          <input
            className="input"
            name="insurance_company"
            placeholder="상대 보험사"
          />

          <select className="input" name="status" defaultValue="NEW">
            {LEAD_STATUSES.map((value) => (
              <option key={value} value={value}>
                {LEAD_STATUS_LABEL[value]}
              </option>
            ))}
          </select>

          <select className="input" name="assigned_to">
            <option value="">담당자 계정 선택</option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </select>

          <select className="input" name="manager_name">
            <option value="">담당자명 선택</option>
            {staffNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <textarea className="input min-h-24" name="memo" placeholder="메모" />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setOpen(false)}
            >
              취소
            </button>

            <button
              className="btn btn-primary"
              type="submit"
              disabled={pending}
            >
              {pending ? "처리 중..." : "확인"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
