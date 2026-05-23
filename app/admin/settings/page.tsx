import { requireAdmin } from "@/lib/auth/get-profile";
import { PageHeader } from "@/components/common/PageHeader";
import { getStaffNameOptions } from "@/lib/data/settings";
export const dynamic="force-dynamic";
export default async function Settings(){await requireAdmin(); const names=await getStaffNameOptions(); return <><PageHeader title="설정" description="초기 버전에서는 옵션 확인 중심으로 제공합니다."/><section className="card p-5"><h2 className="font-black text-white">담당자 기본값</h2><p className="mt-3 text-slate-300">{names.join(", ")}</p><p className="mt-2 text-sm text-slate-500">옵션 수정은 app_settings 테이블의 staff_name_options 값을 변경하면 됩니다.</p></section></>}
