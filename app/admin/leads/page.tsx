import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { LeadTable } from "@/components/leads/LeadTable";
import { getLeads, getProfilesForSelect } from "@/lib/data/leads";
import { getStaffNameOptions } from "@/lib/data/settings";
import { requireAuth } from "@/lib/auth/get-profile";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

function makePageHref({
  page,
  q,
  status,
}: {
  page: number;
  q?: string;
  status?: string;
}) {
  const params = new URLSearchParams();

  if (q) params.set("q", q);
  if (status) params.set("status", status);
  params.set("page", String(page));

  return `/admin/leads?${params.toString()}`;
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: {
    q?: string;
    status?: string;
    page?: string;
  };
}) {
  const profile = await requireAuth();

  const currentPage = Math.max(1, Number(searchParams.page || 1) || 1);
  const q = searchParams.q || "";
  const status = searchParams.status || "";

  const [data, profiles, staffNames] = await Promise.all([
    getLeads({
      query: q,
      status,
      page: currentPage,
    }),
    getProfilesForSelect(),
    getStaffNameOptions(),
  ]);

  const totalCount = data.count || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <>
      <PageHeader
        title="교통사고 DB관리"
        description="상담 DB를 추가하고, 메모와 진행상태를 관리합니다."
      />

      <LeadTable
        rows={data.rows}
        profiles={profiles}
        staffNames={staffNames}
        role={profile.role}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
      />

      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-slate-400">
          총 <b className="text-white">{totalCount}</b>건 · 현재{" "}
          <b className="text-white">{currentPage}</b> / {totalPages}페이지 ·
          페이지당 {PAGE_SIZE}건
        </div>

        <div className="flex items-center gap-2">
          {hasPrev ? (
            <Link
              className="btn btn-secondary"
              href={makePageHref({
                page: currentPage - 1,
                q,
                status,
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
                status,
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