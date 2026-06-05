"use client";

import { useState, useTransition } from "react";
import { upsertContractAction } from "@/app/admin/contracts/actions";
import { Modal } from "@/components/common/Modal";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatKSTDateTime } from "@/lib/utils/date";
import { formatMoney } from "@/lib/utils/format";
import type { ContractRow } from "@/lib/data/contracts";
import type { Profile } from "@/types";

type ContractTableProps = {
  rows: ContractRow[];
  profiles: Profile[];
  staffNames: string[];
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
};

export function ContractTable({
  rows,
  profiles,
  staffNames,
  totalCount = rows.length,
  currentPage = 1,
  pageSize = 20,
}: ContractTableProps) {
  const [edit, setEdit] = useState<ContractRow | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function getRowNumber(index: number) {
    return totalCount - ((currentPage - 1) * pageSize + index);
  }

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await upsertContractAction(formData);

      if (result.ok) {
        setEdit(null);
        setMsg("저장되었습니다.");
        return;
      }

      setMsg(result.error ?? "저장에 실패했습니다.");
    });
  }

  return (
    <>
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
              <th className="p-3 text-left">현황</th>
              <th className="p-3 text-left">1차 담당자</th>
              <th className="p-3 text-left">2차 담당자</th>
              <th className="p-3 text-left">지정 수수료</th>
              <th className="p-3 text-left">합의금</th>
              <th className="p-3 text-left">수수료</th>
              <th className="p-3 text-right">액션</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {rows.length === 0 ? (
              <tr>
                <td
                  className="p-6 text-center text-sm text-slate-500"
                  colSpan={11}
                >
                  등록된 계약 데이터가 없습니다.
                </td>
              </tr>
            ) : null}

            {rows.map((row, index) => {
              const contract = row.lead_contracts?.[0];

              return (
                <tr key={row.id} className="hover:bg-slate-900/70">
                  <td className="p-3 font-semibold text-slate-300">
                    {getRowNumber(index)}
                  </td>

                  <td className="p-3 text-slate-400">
                    {formatKSTDateTime(row.created_at)}
                  </td>

                  <td className="p-3 font-bold text-white">{row.name}</td>

                  <td className="p-3">{row.phone}</td>

                  <td className="p-3">
                    <StatusBadge status={row.status} />
                  </td>

                  <td className="p-3">
                    {contract?.primary_manager_name || "-"}
                  </td>

                  <td className="p-3">
                    {contract?.secondary_manager_name || "-"}
                  </td>

                  <td className="p-3">
                    {contract?.designated_fee_rate || "-"}
                  </td>

                  <td className="p-3">
                    {formatMoney(contract?.settlement_amount)}
                  </td>

                  <td className="p-3">
                    {formatMoney(contract?.fee_amount)}
                  </td>

                  <td className="p-3 text-right">
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => setEdit(row)}
                    >
                      계약관리
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal
        open={Boolean(edit)}
        onClose={() => setEdit(null)}
        title="계약관리"
      >
        {edit ? (
          <form action={submit} className="grid gap-3">
            <input type="hidden" name="lead_id" value={edit.id} />

            <select
              className="input"
              name="primary_manager_id"
              defaultValue={edit.lead_contracts?.[0]?.primary_manager_id || ""}
            >
              <option value="">1차 담당자 계정 선택</option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))}
            </select>

            <select
              className="input"
              name="primary_manager_name"
              defaultValue={
                edit.lead_contracts?.[0]?.primary_manager_name || ""
              }
            >
              <option value="">1차 담당자명 선택</option>
              {staffNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>

            <select
              className="input"
              name="secondary_manager_id"
              defaultValue={
                edit.lead_contracts?.[0]?.secondary_manager_id || ""
              }
            >
              <option value="">2차 담당자 계정 선택</option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))}
            </select>

            <select
              className="input"
              name="secondary_manager_name"
              defaultValue={
                edit.lead_contracts?.[0]?.secondary_manager_name || ""
              }
            >
              <option value="">2차 담당자명 선택</option>
              {staffNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>

            <input
              className="input"
              name="designated_fee_rate"
              defaultValue={
                edit.lead_contracts?.[0]?.designated_fee_rate || ""
              }
              placeholder="지정 수수료율 예: 20"
            />

            <input
              className="input"
              name="settlement_amount"
              defaultValue={edit.lead_contracts?.[0]?.settlement_amount || ""}
              placeholder="합의금 예: 1,000,000"
            />

            <input
              className="input"
              name="fee_amount"
              defaultValue={edit.lead_contracts?.[0]?.fee_amount || ""}
              placeholder="수수료 예: 200,000"
            />

            <textarea
              className="input min-h-24"
              name="memo"
              defaultValue={edit.lead_contracts?.[0]?.memo || ""}
              placeholder="메모"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEdit(null)}
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
        ) : null}
      </Modal>
    </>
  );
}