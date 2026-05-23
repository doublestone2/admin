import { PageHeader } from "@/components/common/PageHeader";
import { ContractTable } from "@/components/contracts/ContractTable";
import { getContractRows } from "@/lib/data/contracts";
import { getProfilesForSelect } from "@/lib/data/leads";
import { getStaffNameOptions } from "@/lib/data/settings";
import { formatMoney } from "@/lib/utils/format";
export const dynamic="force-dynamic";
export default async function ContractsPage(){const [{rows,stats},profiles,staffNames]=await Promise.all([getContractRows(),getProfilesForSelect(),getStaffNameOptions()]); return <><PageHeader title="계약현황" description="교통사고 계약과 수수료를 관리합니다."/><div className="mb-6 grid gap-4 md:grid-cols-4">{[["계약수",stats.contractCount],["종결수",stats.closedCount],["총 합의금",formatMoney(stats.totalSettlement)],["총 수수료",formatMoney(stats.totalFee)]].map(([k,v])=><div className="card p-4" key={k}><p className="text-sm text-slate-400">{k}</p><p className="mt-2 text-2xl font-black text-white">{v}</p></div>)}</div><ContractTable rows={rows} profiles={profiles} staffNames={staffNames}/></>}
