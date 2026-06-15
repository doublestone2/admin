import Link from "next/link";
import { ContractManageButton } from "@/components/contracts/ContractManageButton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatKSTDateTime } from "@/lib/utils/date";
import { formatMoney } from "@/lib/utils/format";
import type { ContractRow } from "@/lib/data/contracts";
import type { LeadCategory } from "@/types";

type ContractTableProps = {
  rows: ContractRow[];
  staffNames: string[];
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
};

const CATEGORY_LABEL: Record<LeadCategory, string> = {
  traffic: "교통사고",
  recovery: "개인회생",
  civil: "민사",
  criminal: "형사",
  etc: "기타",
};

function getCategoryLabel(category?: LeadCategory | null) {
  return CATEGORY_LABEL[category || "traffic"] || "교통사고";
}

export function ContractTable({
  rows,
  staffNames,
  totalCount = rows.length,
  currentPage = 1,
  pageSize = 20,
}: ContractTableProps) {
  function getRowNumber(index: number) {
    return totalCount - ((currentPage - 1) * pageSize + index);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800">
      <table className="w-full text-sm">
        <thead className="bg-slate-900 text-slate-400">
          <tr>
            <th className="w-16 p-3 text-left">No</th>
            <th className="p-3 text-left">등록일</th>
            <th className="p-3 text-left">카테고리</th>
            <th className="p-3 text-left">이름</th>
            <th className="p-3 text-left">전화번호</th>
            <th className="p-3 text-left">현황</th>
            <th className="p-3 text-left">1차 담당자</th>
            <th className="p-3 text-left">2차 담당자</th>
            <th className="p-3 text-left">지정 수수료</th>
            <th className="p-3 text-left">합의금/수임료</th>
            <th className="p-3 text-left">수수료</th>
            <th className="p-3 text-right">액션</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-800">
          {rows.length === 0 ? (
            <tr>
              <td className="p-6 text-center text-sm text-slate-500" colSpan={12}>
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

                <td className="p-3">
                  <span className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-300">
                    {getCategoryLabel(row.category)}
                  </span>
                </td>

                <td className="p-3 font-bold text-white">
                  <Link
                    href={`/admin/leads/${row.id}`}
                    className="hover:text-blue-400 hover:underline"
                  >
                    {row.name}
                  </Link>
                </td>

                <td className="p-3">{row.phone}</td>

                <td className="p-3">
                  <StatusBadge status={row.status} />
                </td>

                <td className="p-3">{contract?.primary_manager_name || "-"}</td>

                <td className="p-3">
                  {contract?.secondary_manager_name || "-"}
                </td>

                <td className="p-3">
                  {contract?.designated_fee_rate || "-"}
                </td>

                <td className="p-3">
                  {formatMoney(contract?.settlement_amount)}
                </td>

                <td className="p-3">{formatMoney(contract?.fee_amount)}</td>

                <td className="p-3 text-right">
                  <ContractManageButton
                    row={row}
                    staffNames={staffNames}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}