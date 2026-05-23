import Link from "next/link";
import { notFound } from "next/navigation";
import { DbFileSection } from "@/components/common/DbFileSection";
import { getDbFiles } from "@/lib/data/files";
import { getPartnerCompany } from "@/lib/data/contacts";

export const dynamic = "force-dynamic";

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

export default async function Detail({ params }: { params: { id: string } }) {
  const [row, files] = await Promise.all([
    getPartnerCompany(params.id),
    getDbFiles("PARTNER", params.id),
  ]);

  if (!row) notFound();

  const partner = row as any;

  const detailFields = [
    {
      label: "업체명",
      value: partner.company_name || partner.name,
    },
    {
      label: "지역",
      value: partner.region,
    },
    {
      label: "연락처",
      value: partner.phone,
    },
    {
      label: "제휴상태",
      value: partner.contract_status || partner.status,
    },
    {
      label: "담당자",
      value: partner.manager_name,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/partners" className="text-sm text-blue-400">
          ← 목록으로
        </Link>

        <h1 className="mt-2 text-2xl font-black text-white">
          {displayValue(partner.company_name || partner.name)}
        </h1>
      </div>

      <section className="card p-5">
        <h2 className="text-lg font-black text-white">기본정보</h2>

        <dl className="mt-4 grid gap-3 md:grid-cols-2">
          {detailFields.map((field) => (
            <div key={field.label} className="rounded-lg bg-slate-950 p-3">
              <dt className="text-xs text-slate-500">{field.label}</dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm font-semibold text-slate-100">
                {displayValue(field.value)}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="card p-5">
        <h2 className="text-lg font-black text-white">메모</h2>

        <p className="mt-3 whitespace-pre-wrap rounded-xl bg-slate-950 p-4 text-sm text-slate-200">
          {partner.memo || "메모가 없습니다."}
        </p>
      </section>

      <DbFileSection targetType="PARTNER" targetId={params.id} files={files} />
    </div>
  );
}