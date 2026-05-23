import { PageHeader } from "@/components/common/PageHeader";
import { ContactTable } from "@/components/contacts/ContactTable";
import { getStaffNameOptions } from "@/lib/data/settings";
import { requireAuth } from "@/lib/auth/get-profile";
import { getPartnerCompanies } from "@/lib/data/contacts";
export const dynamic="force-dynamic";
export default async function Page({ searchParams }: { searchParams: { q?: string } }) {
  const profile = await requireAuth();
  const [data, staffNames] = await Promise.all([getPartnerCompanies(searchParams.q || ""), getStaffNameOptions()]);
  return <><PageHeader title="제휴업체 DB" description="배달대행 지사, 협력업체, 단체를 관리합니다."/><ContactTable kind="partner" rows={data.rows} staffNames={staffNames} role={profile.role}/></>;
}
