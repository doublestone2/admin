import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { LeadCategory, LeadContract, LeadStatus } from "@/types";

export const CONTRACT_PAGE_SIZE = 20;

export type ContractRow = {
  id: string;
  category: LeadCategory | null;
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

type ContractSearchField =
  | "all"
  | "name"
  | "phone"
  | "manager_name"
  | "memo";

type GetContractRowsInput = {
  page?: number;
  paginated?: boolean;
  query?: string;
  field?: ContractSearchField | string;
  start?: string;
  end?: string;
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

function buildLeadFilter(query: string, field: string) {
  if (!query) return "";

  if (field === "name") {
    return `name.ilike.%${query}%`;
  }

  if (field === "phone") {
    return `phone.ilike.%${query}%`;
  }

  if (field === "manager_name") {
    return `manager_name.ilike.%${query}%`;
  }

  return `name.ilike.%${query}%,phone.ilike.%${query}%,manager_name.ilike.%${query}%`;
}

function toStartDateTime(value?: string) {
  if (!value) return "";
  return `${value.slice(0, 10)}T00:00:00.000+09:00`;
}

function toEndDateTime(value?: string) {
  if (!value) return "";
  return `${value.slice(0, 10)}T23:59:59.999+09:00`;
}

async function getLeadIdsFromContracts(query: string, field: string) {
  const supabase = createSupabaseServerClient();

  let q = supabase.from("lead_contracts").select("lead_id").limit(1000);

  if (field === "memo") {
    q = q.ilike("memo", `%${query}%`);
  } else if (field === "manager_name") {
    q = q.or(
      `primary_manager_name.ilike.%${query}%,secondary_manager_name.ilike.%${query}%,manager_name.ilike.%${query}%`
    );
  } else {
    q = q.or(
      `memo.ilike.%${query}%,primary_manager_name.ilike.%${query}%,secondary_manager_name.ilike.%${query}%,manager_name.ilike.%${query}%`
    );
  }

  const { data, error } = await q;

  if (error) throw new Error(error.message);

  return Array.from(
    new Set(((data || []) as any[]).map((row) => row.lead_id).filter(Boolean))
  );
}

async function getLeadIdsFromContractsByDate(start?: string, end?: string) {
  if (!start && !end) return [];

  const supabase = createSupabaseServerClient();

  let q = supabase.from("lead_contracts").select("lead_id").limit(1000);

  const startDateTime = toStartDateTime(start);
  const endDateTime = toEndDateTime(end);

  if (startDateTime && endDateTime) {
    q = q.or(
      `contract_date.gte.${startDateTime},settlement_date.gte.${startDateTime},closed_at.gte.${startDateTime},completed_at.gte.${startDateTime},updated_at.gte.${startDateTime}`
    );
  } else if (startDateTime) {
    q = q.or(
      `contract_date.gte.${startDateTime},settlement_date.gte.${startDateTime},closed_at.gte.${startDateTime},completed_at.gte.${startDateTime},updated_at.gte.${startDateTime}`
    );
  } else if (endDateTime) {
    q = q.or(
      `contract_date.lte.${endDateTime},settlement_date.lte.${endDateTime},closed_at.lte.${endDateTime},completed_at.lte.${endDateTime},updated_at.lte.${endDateTime}`
    );
  }

  const { data, error } = await q;

  if (error) {
    return [];
  }

  return Array.from(
    new Set(((data || []) as any[]).map((row) => row.lead_id).filter(Boolean))
  );
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
  const queryText = String(input.query || "").trim();
  const field = String(input.field || "all");
  const start = String(input.start || "").trim();
  const end = String(input.end || "").trim();

  const { from, to } = getPageRange(page);

  const supabase = createSupabaseServerClient();

  let contractLeadIds: string[] = [];
  let dateLeadIds: string[] = [];

  if (
    queryText &&
    (field === "all" || field === "memo" || field === "manager_name")
  ) {
    contractLeadIds = await getLeadIdsFromContracts(queryText, field);
  }

  if (start || end) {
    dateLeadIds = await getLeadIdsFromContractsByDate(start, end);
  }

  if (queryText && field === "memo" && contractLeadIds.length === 0) {
    return {
      rows: [],
      stats: calcContractStats([]),
      count: 0,
      page,
      pageSize: CONTRACT_PAGE_SIZE,
      totalPages: 1,
    };
  }

  if ((start || end) && dateLeadIds.length === 0) {
    return {
      rows: [],
      stats: calcContractStats([]),
      count: 0,
      page,
      pageSize: CONTRACT_PAGE_SIZE,
      totalPages: 1,
    };
  }

  let query = supabase
    .from("leads")
    .select(
      `
      id,
      category,
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

  if (start || end) {
    query = query.in("id", dateLeadIds);
  }

  if (queryText) {
    if (field === "memo") {
      query = query.in("id", contractLeadIds);
    } else if (
      (field === "all" || field === "manager_name") &&
      contractLeadIds.length > 0
    ) {
      const leadFilter = buildLeadFilter(queryText, field);
      const contractFilter = `id.in.(${contractLeadIds.join(",")})`;

      query = query.or(`${leadFilter},${contractFilter}`);
    } else {
      query = query.or(buildLeadFilter(queryText, field));
    }
  }

  if (input.paginated) {
    query = query.range(from, to);
  } else {
    query = query.limit(1000);
  }

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  const rows = ((data || []) as any[]).map((row) => ({
    ...row,
    category: row.category || "traffic",
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