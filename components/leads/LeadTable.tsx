import Link from "next/link";
import { LeadCreateButton } from "@/components/leads/LeadCreateButton";
import { LeadRowActions } from "@/components/leads/LeadRowActions";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatKSTDateTime } from "@/lib/utils/date";
import type { LeadRow } from "@/lib/data/leads";

type LeadTableProps = {
  rows: LeadRow[];
  staffNames: string[];
  role: string;
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
};

export function LeadTable({
  rows,
  staffNames,
  role,
  totalCount = rows.length,
  currentPage = 1,
  pageSize = 20,
}: LeadTableProps) {
  function getRowNumber(index: number) {
    return totalCount - ((currentPage - 1) * pageSize + index);
  }

  return (
    <>
      <LeadCreateButton staffNames={staffNames} />

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
              <tr key={row.id} className="hover:bg-slate-900/70">
                <td className="p-3 font-semibold text-slate-300">
                  {getRowNumber(index)}
                </td>

                <td className="p-3 text-slate-400">
                  {formatKSTDateTime(row.created_at)}
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
                  <LeadRowActions
                    id={row.id}
                    latestNote={row.latest_note}
                    role={role}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}