import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { ContractTable } from "@/components/contracts/ContractTable";
import { getContractRows } from "@/lib/data/contracts";
import { getProfilesForSelect } from "@/lib/data/leads";
import { getStaffNameOptions } from "@/lib/data/settings";
import { formatMoney } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

function makePageHref(page: number) {
  const params = new URLSearchParams();
  params.set("page", String(page));

  return `/admin/contracts?${params.toString()}`;
}

export default async function ContractsPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
  };
}) {
  const currentPage = Math.max(1, Number(searchParams.page || 1) || 1);

  const [{ rows, stats, count, totalPages, pageSize }, profiles, staffNames] =
    await Promise.all([
      getContractRows({
        page: currentPage,
        paginated: true,
      }),
      getProfilesForSelect(),
      getStaffNameOptions(),
    ]);

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <>
      <PageHeader
        title="계약현황"
        description="교통사고 계약과 수수료를 관리합니다."
      />

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        {[
          ["계약", stats.contractCount],
          ["종결", stats.closedCount],
          ["총 합의금", formatMoney(stats.totalSettlement)],
          ["총 수수료", formatMoney(stats.totalFee)],
        ].map(([key, value]) => (
          <div className="card p-4" key={key}>
            <p className="text-sm text-slate-400">{key}</p>
            <p className="mt-2 text-2xl font-black text-white">{value}</p>
          </div>
        ))}
      </div>

      <ContractTable
        rows={rows}
        profiles={profiles}
        staffNames={staffNames}
        totalCount={count}
        currentPage={currentPage}
         pageSize={pageSize}
        />

      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-slate-400">
          총 <b className="text-white">{count}</b>건 · 현재{" "}
          <b className="text-white">{currentPage}</b> / {totalPages}페이지 ·
          페이지당 {pageSize}건
        </div>

        <div className="flex items-center gap-2">
          {hasPrev ? (
            <Link
              className="btn btn-secondary"
              href={makePageHref(currentPage - 1)}
            >
              이전
            </Link>
          ) : (
            <button className="btn btn-secondary opacity-40" disabled>
              이전
            </button>
          )}

          {hasNext ? (
            <Link
              className="btn btn-secondary"
              href={makePageHref(currentPage + 1)}
            >
              다음
            </Link>
          ) : (
            <button className="btn btn-secondary opacity-40" disabled>
              다음
            </button>
          )}
        </div>
      </div>
    </>
  );
}