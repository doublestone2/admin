import Link from "next/link";
import { ContactCreateButton } from "@/components/contacts/ContactCreateButton";
import { ContactRowActions } from "@/components/contacts/ContactRowActions";
import { formatKSTDateTime } from "@/lib/utils/date";

type Kind = "insurance" | "partner" | "hospital";

type ContactTableProps = {
  kind: Kind;
  rows: any[];
  staffNames: string[];
  role: string;
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
};

function getBase(kind: Kind) {
  if (kind === "insurance") return "/admin/insurance";
  if (kind === "partner") return "/admin/partners";
  return "/admin/hospitals";
}

export function ContactTable({
  kind,
  rows,
  staffNames,
  role,
  totalCount = rows.length,
  currentPage = 1,
  pageSize = 20,
}: ContactTableProps) {
  const base = getBase(kind);

  function getRowNumber(index: number) {
    return totalCount - ((currentPage - 1) * pageSize + index);
  }

  return (
    <>
      <ContactCreateButton kind={kind} staffNames={staffNames} />

      <div className="overflow-hidden rounded-xl border border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="w-16 p-3 text-left">No</th>

              {kind === "insurance" ? (
                <>
                  <th className="p-3 text-left">등록일</th>
                  <th className="p-3 text-left">보험사</th>
                  <th className="p-3 text-left">담당자</th>
                  <th className="p-3 text-left">직급</th>
                  <th className="p-3 text-left">전화번호</th>
                  <th className="p-3 text-left">메모</th>
                </>
              ) : null}

              {kind === "partner" ? (
                <>
                  <th className="p-3 text-left">등록일</th>
                  <th className="p-3 text-left">업체명</th>
                  <th className="p-3 text-left">지역</th>
                  <th className="p-3 text-left">연락처</th>
                  <th className="p-3 text-left">계약여부</th>
                  <th className="p-3 text-left">담당자</th>
                  <th className="p-3 text-left">메모</th>
                </>
              ) : null}

              {kind === "hospital" ? (
                <>
                  <th className="p-3 text-left">등록일</th>
                  <th className="p-3 text-left">병원명</th>
                  <th className="p-3 text-left">지역</th>
                  <th className="p-3 text-left">유형</th>
                  <th className="p-3 text-left">제휴상태</th>
                  <th className="p-3 text-left">담당자</th>
                  <th className="p-3 text-left">메모</th>
                </>
              ) : null}

              <th className="p-3 text-right">액션</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {rows.length === 0 ? (
              <tr>
                <td
                  className="p-6 text-center text-sm text-slate-500"
                  colSpan={9}
                >
                  등록된 데이터가 없습니다.
                </td>
              </tr>
            ) : null}

            {rows.map((row: any, index: number) => (
              <tr key={row.id} className="hover:bg-slate-900/70">
                <td className="p-3 font-semibold text-slate-300">
                  {getRowNumber(index)}
                </td>

                {kind === "insurance" ? (
                  <>
                    <td className="p-3 text-slate-400">
                      {formatKSTDateTime(row.created_at)}
                    </td>
                    <td className="p-3 font-bold text-white">
                      <Link
                        href={`${base}/${row.id}`}
                        className="hover:text-blue-400 hover:underline"
                      >
                        {row.insurance_company || "-"}
                      </Link>
                    </td>
                    <td className="p-3">{row.manager_name || "-"}</td>
                    <td className="p-3">{row.position || "-"}</td>
                    <td className="p-3">{row.phone || "-"}</td>
                    <td className="max-w-xs truncate p-3 text-slate-400">
                      {row.memo || "-"}
                    </td>
                  </>
                ) : null}

                {kind === "partner" ? (
                  <>
                    <td className="p-3 text-slate-400">
                      {formatKSTDateTime(row.created_at)}
                    </td>
                    <td className="p-3 font-bold text-white">
                      <Link
                        href={`${base}/${row.id}`}
                        className="hover:text-blue-400 hover:underline"
                      >
                        {row.company_name || row.name || "-"}
                      </Link>
                    </td>
                    <td className="p-3">{row.region || "-"}</td>
                    <td className="p-3">{row.phone || "-"}</td>
                    <td className="p-3">{row.contract_status || "-"}</td>
                    <td className="p-3">{row.manager_name || "-"}</td>
                    <td className="max-w-xs truncate p-3 text-slate-400">
                      {row.memo || "-"}
                    </td>
                  </>
                ) : null}

                {kind === "hospital" ? (
                  <>
                    <td className="p-3 text-slate-400">
                      {formatKSTDateTime(row.created_at)}
                    </td>
                    <td className="p-3 font-bold text-white">
                      <Link
                        href={`${base}/${row.id}`}
                        className="hover:text-blue-400 hover:underline"
                      >
                        {row.hospital_name || row.name || "-"}
                      </Link>
                    </td>
                    <td className="p-3">{row.region || "-"}</td>
                    <td className="p-3">{row.hospital_type || "-"}</td>
                    <td className="p-3">{row.partnership_status || "-"}</td>
                    <td className="p-3">
                      {row.internal_manager_name || row.manager_name || "-"}
                    </td>
                    <td className="max-w-xs truncate p-3 text-slate-400">
                      {row.memo || "-"}
                    </td>
                  </>
                ) : null}

                <td className="p-3 text-right">
                  <ContactRowActions
                    kind={kind}
                    row={row}
                    staffNames={staffNames}
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