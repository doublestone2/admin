import { PageHeader } from "@/components/common/PageHeader";
import { LeadTable } from "@/components/leads/LeadTable";
import { getLeads, LEAD_PAGE_SIZE } from "@/lib/data/leads";
import { getStaffNameOptions } from "@/lib/data/settings";
import { requireAuth } from "@/lib/auth/get-profile";
import { ListSearchBar } from "@/components/common/ListSearchBar";
import { Pagination } from "@/components/common/Pagination";

export const dynamic = "force-dynamic";

const SEARCH_OPTIONS = [
  { label: "전체", value: "all" },
  { label: "이름", value: "name" },
  { label: "전화번호", value: "phone" },
  { label: "상대 보험사", value: "insurance_company" },
  { label: "담당자", value: "manager_name" },
  { label: "메모", value: "memo" },
];

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: {
    q?: string;
    field?: string;
    status?: string;
    page?: string;
  };
}) {
  const currentPage = Math.max(1, Number(searchParams.page || 1) || 1);
  const q = String(searchParams.q || "").trim();
  const field = searchParams.field || "all";
  const status = searchParams.status || "";

  const [profile, data, staffNames] = await Promise.all([
    requireAuth(),
    getLeads({
      query: q,
      field,
      status,
      page: currentPage,
    }),
    getStaffNameOptions(),
  ]);

  const totalCount = data.count || 0;
  const totalPages = data.totalPages || 1;
  const pageSize = data.pageSize || LEAD_PAGE_SIZE;

  return (
    <>
      <PageHeader
        title="교통사고 DB관리"
        description="상담 DB를 추가하고, 메모와 진행상태를 관리합니다."
      />

      <ListSearchBar
        basePath="/admin/leads"
        query={q}
        field={field}
        options={SEARCH_OPTIONS}
      />

      <LeadTable
        rows={data.rows}
        staffNames={staffNames}
        role={profile.role}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={pageSize}
      />

      <div className="mt-4 text-sm text-slate-400">
        총 <b className="text-white">{totalCount}</b>건 · 현재{" "}
        <b className="text-white">{currentPage}</b> / {totalPages}페이지 ·
        페이지당 {pageSize}건
      </div>

      <Pagination
        basePath="/admin/leads"
        currentPage={currentPage}
        totalPages={totalPages}
        query={q}
        field={field}
        status={status}
      />
    </>
  );
}