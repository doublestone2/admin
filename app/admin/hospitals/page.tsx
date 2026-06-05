import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { ContactTable } from "@/components/contacts/ContactTable";
import { getStaffNameOptions } from "@/lib/data/settings";
import { requireAuth } from "@/lib/auth/get-profile";
import { getHospitals } from "@/lib/data/contacts";

export const dynamic = "force-dynamic";

function makePageHref({
  page,
  q,
}: {
  page: number;
  q?: string;
}) {
  const params = new URLSearchParams();

  if (q) params.set("q", q);
  params.set("page", String(page));

  return `/admin/hospitals?${params.toString()}`;
}

export default async function Page({
  searchParams,
}: {
  searchParams: {
    q?: string;
    page?: string;
  };
}) {
  const profile = await requireAuth();

  const q = searchParams.q || "";
  const currentPage = Math.max(1, Number(searchParams.page || 1) || 1);

  const [data, staffNames] = await Promise.all([
    getHospitals({
      query: q,
      page: currentPage,
    }),
    getStaffNameOptions(),
  ]);

  const totalCount = data.count || 0;
  const totalPages = data.totalPages || 1;
  const pageSize = data.pageSize || 20;

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <>
      <PageHeader
        title="병원 DB"
        description="병원 영업 및 제휴 정보를 관리합니다."
      />

      <ContactTable
        kind="hospital"
        rows={data.rows}
        staffNames={staffNames}
        role={profile.role}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={pageSize}
      />

      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-slate-400">
          총 <b className="text-white">{totalCount}</b>건 · 현재{" "}
          <b className="text-white">{currentPage}</b> / {totalPages}페이지
        </div>

        <div className="flex items-center gap-2">
          {hasPrev ? (
            <Link
              className="btn btn-secondary"
              href={makePageHref({
                page: currentPage - 1,
                q,
              })}
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
              href={makePageHref({
                page: currentPage + 1,
                q,
              })}
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