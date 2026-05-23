import Link from "next/link";
import { notFound } from "next/navigation";
import { DbFileSection } from "@/components/common/DbFileSection";
import { getDbFiles } from "@/lib/data/files";
import { getHospital } from "@/lib/data/contacts";
import { formatKSTDateTime } from "@/lib/utils/date";
export const dynamic="force-dynamic";
export default async function Detail({ params }: { params: { id: string } }) {
  const [row, files] = await Promise.all([getHospital(params.id), getDbFiles("HOSPITAL", params.id)]);
  if (!row) notFound();
  const entries = Object.entries(row).filter(([k])=>!["id","deleted_at","created_by"].includes(k));
  return <div className="space-y-6"><div><Link href="/admin/hospitals" className="text-sm text-blue-400">← 목록으로</Link><h1 className="mt-2 text-2xl font-black text-white">{(row as any).hospital_name}</h1></div><section className="card p-5"><h2 className="text-lg font-black text-white">기본정보</h2><dl className="mt-4 grid gap-3 md:grid-cols-2">{entries.map(([k,v])=><div key={k} className="rounded-lg bg-slate-950 p-3"><dt className="text-xs text-slate-500">{k}</dt><dd className="mt-1 whitespace-pre-wrap text-sm text-slate-100">{k.includes("_at") ? formatKSTDateTime(String(v)) : String(v ?? "-")}</dd></div>)}</dl></section><section className="card p-5"><h2 className="text-lg font-black text-white">메모</h2><p className="mt-3 whitespace-pre-wrap rounded-xl bg-slate-950 p-4 text-sm text-slate-200">{(row as any).memo || "메모가 없습니다."}</p></section><DbFileSection targetType="HOSPITAL" targetId={params.id} files={files}/></div>;
}
