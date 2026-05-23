import Link from "next/link";
import { notFound } from "next/navigation";
import { DbFileSection } from "@/components/common/DbFileSection";
import { getDbFiles } from "@/lib/data/files";
import { getHospital } from "@/lib/data/contacts";

export const dynamic = "force-dynamic";

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value);
}

export default async function Detail({ params }: { params: { id: string } }) {
  const [row, files] = await Promise.all([
    getHospital(params.id),
    getDbFiles("HOSPITAL", params.id),
  ]);

  if (!row) notFound();

  const hospital = row as any;

  const detailFields = [
    {
      label: "병원명",
      value: hospital.hospital_name || hospital.name,
    },
    {
      label: "병원유형",
      value: hospital.hospital_type,
    },
    {
      label: "지역",
      value: hospital.region,
    },
    {
      label: "연락처",
      value: hospital.phone || hospital.hospital_phone,
    },
    {
      label: "주소",
      value: hospital.address || hospital.hospital_address,
    },
    {
      label: "담당자",
      value: hospital.internal_manager_name || hospital.manager_name,
    },
    {
      label: "제휴상태",
      value: hospital.contract_status || hospital.partnership_status || hospital.status,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/hospitals" className="text-sm text-blue-400">
          ← 목록으로
        </Link>

        <h1 className="mt-2 text-2xl font-black text-white">
          {displayValue(hospital.hospital_name || hospital.name)}
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
          {hospital.memo || hospital.partnership_memo || "메모가 없습니다."}
        </p>
      </section>

      <DbFileSection targetType="HOSPITAL" targetId={params.id} files={files} />
    </div>
  );
}