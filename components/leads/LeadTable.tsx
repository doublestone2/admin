import Link from "next/link";
import { LeadCreateButton } from "@/components/leads/LeadCreateButton";
import { LeadRowActions } from "@/components/leads/LeadRowActions";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatKSTDateTime } from "@/lib/utils/date";
import type { LeadCategory } from "@/types";
import type { LeadRow } from "@/lib/data/leads";

type LeadTableProps = {
  rows: LeadRow[];
  staffNames: string[];
  role: string;
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
  category?: LeadCategory;
};

const CATEGORY_LABEL: Record<LeadCategory, string> = {
  traffic: "교통사고",
  recovery: "개인회생",
  civil: "민사",
  criminal: "형사",
  etc: "기타",
};

function getCategoryColumns(category: LeadCategory) {
  if (category === "recovery") {
    return ["채무금액", "직업/소득", "거주지역"];
  }

  if (category === "civil") {
    return ["사건유형", "청구금액", "상대방"];
  }

  if (category === "criminal") {
    return ["사건유형", "구분", "진행단계"];
  }

  if (category === "etc") {
    return ["사건유형", "상담내용", "지역"];
  }

  return ["연락방법", "상대 보험사", "구분"];
}

function getCategoryValues(row: LeadRow, category: LeadCategory) {
  if (category === "recovery") {
    return [row.debt_amount || "-", row.job_income || "-", row.region || "-"];
  }

  if (category === "civil") {
    return [
      row.case_type || "-",
      row.claim_amount || "-",
      row.opposing_party || "-",
    ];
  }

  if (category === "criminal") {
    return [
      row.case_type || "-",
      row.criminal_position || "-",
      row.case_stage || "-",
    ];
  }

  if (category === "etc") {
    return [
      row.case_type || "-",
      row.case_summary || "-",
      row.region || "-",
    ];
  }

  return [
    row.contact_method || "-",
    row.insurance_company || "-",
    CATEGORY_LABEL[row.category || "traffic"] || "교통사고",
  ];
}

export function LeadTable({
  rows,
  staffNames,
  role,
  totalCount = rows.length,
  currentPage = 1,
  pageSize = 15,
  category = "traffic",
}: LeadTableProps) {
  const columns = getCategoryColumns(category);

  function getRowNumber(index: number) {
    return totalCount - ((currentPage - 1) * pageSize + index);
  }

  return (
    <>
      <LeadCreateButton
        staffNames={staffNames}
        category={category}
        title={`${CATEGORY_LABEL[category]} DB 추가`}
      />

      <div className="overflow-hidden rounded-xl border border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="w-16 p-3 text-left">No</th>
              <th className="p-3 text-left">등록일</th>
              <th className="p-3 text-left">이름</th>
              <th className="p-3 text-left">전화번호</th>
              {columns.map((column) => (
                <th key={column} className="p-3 text-left">
                  {column}
                </th>
              ))}
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
                  colSpan={11}
                  className="p-6 text-center text-sm text-slate-500"
                >
                  등록된 DB가 없습니다.
                </td>
              </tr>
            ) : null}

            {rows.map((row, index) => {
              const values = getCategoryValues(row, category);

              return (
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

                  {values.map((value, valueIndex) => (
                    <td
                      key={`${row.id}-${valueIndex}`}
                      className="max-w-xs truncate p-3"
                    >
                      {value}
                    </td>
                  ))}

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
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}