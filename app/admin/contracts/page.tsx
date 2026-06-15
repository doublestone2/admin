import { PageHeader } from "@/components/common/PageHeader";
import { ContractTable } from "@/components/contracts/ContractTable";
import { getContractRows } from "@/lib/data/contracts";
import { getStaffNameOptions } from "@/lib/data/settings";
import { formatMoney } from "@/lib/utils/format";
import { ListSearchBar } from "@/components/common/ListSearchBar";
import { Pagination } from "@/components/common/Pagination";

export const dynamic = "force-dynamic";

const SEARCH_OPTIONS = [
  { label: "전체", value: "all" },
  { label: "이름", value: "name" },
  { label: "전화번호", value: "phone" },
  { label: "담당자", value: "manager_name" },
  { label: "메모", value: "memo" },
];

export default async function ContractsPage({
  searchParams,
}: {
  searchParams: {
    q?: string;
    field?: string;
    page?: string;
  };
}) {
  const currentPage = Math.max(1, Number(searchParams.page || 1) || 1);
  const q = String(searchParams.q || "").trim();
  const field = searchParams.field || "all";

  const [{ rows, stats, count, totalPages, pageSize }, staffNames] =
    await Promise.all([
      getContractRows({
        page: currentPage,
        paginated: true,
        query: q,
        field,
      }),
      getStaffNameOptions(),
    ]);

  return (
    <>
      <PageHeader
        title="계약현황"
        description="교통사고, 개인회생, 민사, 형사, 기타 수임 DB의 계약과 수수료를 관리합니다."
      />

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        {[
          ["계약", stats.contractCount],
          ["종결", stats.closedCount],
          ["총 합의금/수임료", formatMoney(stats.totalSettlement)],
          ["총 수수료", formatMoney(stats.totalFee)],
        ].map(([key, value]) => (
          <div className="card p-4" key={key}>
            <p className="text-sm text-slate-400">{key}</p>
            <p className="mt-2 text-2xl font-black text-white">{value}</p>
          </div>
        ))}
      </div>

      <ListSearchBar
        basePath="/admin/contracts"
        query={q}
        field={field}
        options={SEARCH_OPTIONS}
      />

      <ContractTable
        rows={rows}
        staffNames={staffNames}
        totalCount={count}
        currentPage={currentPage}
        pageSize={pageSize}
      />

      <div className="mt-4 text-sm text-slate-400">
        총 <b className="text-white">{count}</b>건 · 현재{" "}
        <b className="text-white">{currentPage}</b> / {totalPages}페이지 ·
        페이지당 {pageSize}건
      </div>

      <Pagination
        basePath="/admin/contracts"
        currentPage={currentPage}
        totalPages={totalPages}
        query={q}
        field={field}
      />
    </>
  );
}