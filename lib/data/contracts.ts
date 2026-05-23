import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { LeadContract, LeadStatus } from "@/types";

export type ContractRow = {
  id: string;
  name: string;
  phone: string;
  status: LeadStatus;
  manager_name: string | null;
  created_at: string;
  lead_contracts: LeadContract[];
};

function money(v: any) { const n = Number(v || 0); return Number.isFinite(n) ? n : 0; }
export function calcContractStats(rows: ContractRow[]) {
  const contracts = rows.map(r => r.lead_contracts?.[0]).filter(Boolean) as LeadContract[];
  return {
    contractCount: rows.filter(r => r.status === "CONTRACTED").length,
    closedCount: rows.filter(r => r.status === "CLOSED").length,
    totalSettlement: contracts.reduce((a,c)=>a+money(c.settlement_amount),0),
    totalFee: contracts.reduce((a,c)=>a+money(c.fee_amount),0)
  };
}

export async function getContractRows() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("leads")
    .select("id,name,phone,status,manager_name,created_at,lead_contracts(*)")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = ((data || []) as any[]).map(r => ({...r, lead_contracts: Array.isArray(r.lead_contracts) ? r.lead_contracts : r.lead_contracts ? [r.lead_contracts] : []})) as ContractRow[];
  return { rows, stats: calcContractStats(rows) };
}
