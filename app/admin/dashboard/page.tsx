import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { getDashboardData } from "@/lib/data/dashboard";
import { formatKSTDateTime } from "@/lib/utils/date";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();

  const cards = [
    ["전체 DB", data.total],
    ["오늘 유입", data.today],
    ["신규", data.newCount],
    ["상담중", data.inProgress],
    ["계약완료", data.contracted],
    ["종결", data.closed],
  ];

  return (
    <>
      <PageHeader
        title="대시보드"
        description="교통사고 합의대행 운영 현황"
      />

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {cards.map(([label, value]) => (
          <div className="card p-4" key={label}>
            <p className="text-sm text-slate-400">{label}</p>
            <p className="mt-2 text-2xl font-black text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="card p-5">
          <h2 className="font-black text-white">최근 등록 DB</h2>

          <div className="mt-3 space-y-2">
            {data.recent.length === 0 ? (
              <p className="text-sm text-slate-500">최근 등록 DB가 없습니다.</p>
            ) : null}

            {data.recent.map((row: any) => (
              <div key={row.id} className="rounded-lg bg-slate-950 p-3">
                <div className="flex items-center justify-between gap-3">
                  <b className="truncate">{row.name}</b>
                  <StatusBadge status={row.status} />
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  {row.phone || "-"} · {formatKSTDateTime(row.created_at)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="font-black text-white">최근 메모</h2>

          <div className="mt-3 space-y-2">
            {data.notes.length === 0 ? (
              <p className="text-sm text-slate-500">최근 메모가 없습니다.</p>
            ) : null}

            {data.notes.map((note: any) => (
              <div key={note.id} className="rounded-lg bg-slate-950 p-3">
                <p className="line-clamp-2 text-sm">{note.content}</p>

                <p className="mt-2 text-xs text-slate-500">
                  {note.profiles?.name || "-"} ·{" "}
                  {formatKSTDateTime(note.created_at)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}