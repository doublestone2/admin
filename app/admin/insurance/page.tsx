import { PageHeader } from "@/components/common/PageHeader";
import { ContactTable } from "@/components/contacts/ContactTable";
import { getStaffNameOptions } from "@/lib/data/settings";
import { requireAuth } from "@/lib/auth/get-profile";
import { getInsuranceContacts } from "@/lib/data/contacts";
export const dynamic="force-dynamic";
export default async function Page({ searchParams }: { searchParams: { q?: string } }) {
  const profile = await requireAuth();
  const [data, staffNames] = await Promise.all([getInsuranceContacts(searchParams.q || ""), getStaffNameOptions()]);
  return <><PageHeader title="보험사 DB" description="보험사 담당자 정보를 관리합니다."/><ContactTable kind="insurance" rows={data.rows} staffNames={staffNames} role={profile.role}/></>;
}
