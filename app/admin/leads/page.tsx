import { PageHeader } from "@/components/common/PageHeader";
import { LeadTable } from "@/components/leads/LeadTable";
import { getLeads, getProfilesForSelect } from "@/lib/data/leads";
import { getStaffNameOptions } from "@/lib/data/settings";
import { requireAuth } from "@/lib/auth/get-profile";
export const dynamic="force-dynamic";
export default async function LeadsPage({searchParams}:{searchParams:{q?:string;status?:string;page?:string}}){const profile=await requireAuth(); const [data,profiles,staffNames]=await Promise.all([getLeads({query:searchParams.q||"",status:searchParams.status||"",page:Number(searchParams.page||1)}),getProfilesForSelect(),getStaffNameOptions()]); return <><PageHeader title="교통사고 DB관리" description="상담 DB를 추가, 메모, 삭제할 수 있습니다."/><LeadTable rows={data.rows} profiles={profiles} staffNames={staffNames} role={profile.role}/></>}
