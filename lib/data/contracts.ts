import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { LeadContract, LeadStatus } from "@/types";

export const CONTRACT_PAGE_SIZE = 20;

export type ContractRow = {
  id: string;
  name: string;
  phone: string;
  status: LeadStatus;
  manager_name: string | null;
  assigned_to?: string | null;
  created_at: string;
  profiles?: {
    name: string | null;
    email: string | null;
  } | null;
  lead_contracts: LeadContract[];
};

type GetContractRowsInput = {
  page?: number;
  paginated?: boolean;
};

function money(value: unknown) {
  const raw = String(value || "0").replaceAll(",", "");
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function normalizeLeadContracts(value: unknown): LeadContract[] {
  if (Array.isArray(value)) return value as LeadContract[];
  if (value) return [value as LeadContract];
  return [];
}

function getPageRange(page: number) {
  const safePage = Math.max(1, Number(page || 1));
  const from = (safePage - 1) * CONTRACT_PAGE_SIZE;
  const to = from + CONTRACT_PAGE_SIZE - 1;

  return {
    page: safePage,
    from,
    to,
  };
}

function getTotalPages(count: number) {
  return Math.max(1, Math.ceil((count || 0) / CONTRACT_PAGE_SIZE));
}

export function calcContractStats(rows: ContractRow[]) {
  const contracts = rows
    .map((row) => row.lead_contracts?.[0])
    .filter(Boolean) as LeadContract[];

  return {
    contractCount: rows.filter((row) => row.status === "CONTRACTED").length,
    closedCount: rows.filter((row) => row.status === "CLOSED").length,
    totalSettlement: contracts.reduce(
      (sum, contract: any) =>
        sum +
        money(
          contract.final_settlement_amount ||
            contract.settlement_amount ||
            contract.total_settlement ||
            contract.final_amount
        ),
      0
    ),
    totalFee: contracts.reduce(
      (sum, contract: any) =>
        sum +
        money(
          contract.fee_amount ||
            contract.success_fee ||
            contract.commission_amount
        ),
      0
    ),
  };
}

export async function getContractRows(input: GetContractRowsInput = {}) {
  const page = Math.max(1, Number(input.page || 1));
  const { from, to } = getPageRange(page);

  const supabase = createSupabaseServerClient();

  let query = supabase
    .from("leads")
    .select(
      `
      id,
      name,
      phone,
      status,
      manager_name,
      assigned_to,
      created_at,
      profiles:assigned_to(name,email),
      lead_contracts(*)
    `,
      { count: "exact" }
    )
    .is("deleted_at", null)
    .in("status", ["CONTRACTED", "CLOSED"])
    .order("created_at", { ascending: false });

  if (input.paginated) {
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  const rows = ((data || []) as any[]).map((row) => ({
    ...row,
    profiles: Array.isArray(row.profiles)
      ? row.profiles[0] || null
      : row.profiles,
    lead_contracts: normalizeLeadContracts(row.lead_contracts),
  })) as ContractRow[];

  const totalCount = count || rows.length;

  return {
    rows,
    stats: calcContractStats(rows),
    count: totalCount,
    page,
    pageSize: CONTRACT_PAGE_SIZE,
    totalPages: getTotalPages(totalCount),
  };
}