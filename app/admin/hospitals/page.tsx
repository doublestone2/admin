import { PageHeader } from "@/components/common/PageHeader";
import { ContactTable } from "@/components/contacts/ContactTable";
import { getStaffNameOptions } from "@/lib/data/settings";
import { requireAuth } from "@/lib/auth/get-profile";
import { getHospitals } from "@/lib/data/contacts";
export const dynamic="force-dynamic";
export default async function Page({ searchParams }: { searchParams: { q?: string } }) {
  const profile = await requireAuth();
  const [data, staffNames] = await Promise.all([getHospitals(searchParams.q || ""), getStaffNameOptions()]);
  return <><PageHeader title="병원 DB" description="병원 영업 및 제휴 정보를 관리합니다."/><ContactTable kind="hospital" rows={data.rows} staffNames={staffNames} role={profile.role}/></>;
}
