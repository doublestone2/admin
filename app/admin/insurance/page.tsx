import { PageHeader } from "@/components/common/PageHeader";
import { ContactTable } from "@/components/contacts/ContactTable";
import { getStaffNameOptions } from "@/lib/data/settings";
import { requireAuth } from "@/lib/auth/get-profile";
import { getInsuranceContacts } from "@/lib/data/contacts";
import { ListSearchBar } from "@/components/common/ListSearchBar";
import { Pagination } from "@/components/common/Pagination";

export const dynamic = "force-dynamic";

const SEARCH_OPTIONS = [
  { label: "전체", value: "all" },
  { label: "보험사", value: "company_name" },
  { label: "담당자", value: "manager_name" },
  { label: "전화번호", value: "phone" },
  { label: "메모", value: "memo" },
];

export default async function InsurancePage({
  searchParams,
}: {
  searchParams: {
    q?: string;
    field?: string;
    page?: string;
  };
}) {
  const q = String(searchParams.q || "").trim();
  const field = searchParams.field || "all";
  const currentPage = Math.max(1, Number(searchParams.page || 1) || 1);

  const [profile, data, staffNames] = await Promise.all([
    requireAuth(),
    getInsuranceContacts({
      query: q,
      field,
      page: currentPage,
    }),
    getStaffNameOptions(),
  ]);

  const totalCount = data.count || 0;
  const totalPages = data.totalPages || 1;
  const pageSize = data.pageSize || 20;

  return (
    <>
      <PageHeader
        title="보험사 DB"
        description="보험사 담당자 정보를 관리합니다."
      />

      <ListSearchBar
        basePath="/admin/insurance"
        query={q}
        field={field}
        options={SEARCH_OPTIONS}
      />

      <ContactTable
        kind="insurance"
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
        basePath="/admin/insurance"
        currentPage={currentPage}
        totalPages={totalPages}
        query={q}
        field={field}
      />
    </>
  );
}