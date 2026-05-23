import { NextResponse } from "next/server";
import { getContractRows } from "@/lib/data/contracts";

export const dynamic = "force-dynamic";

function toNumber(value: unknown) {
  const raw = String(value || "0").replaceAll(",", "");
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function toDateOnly(value: unknown) {
  if (!value) return "";

  const raw = String(value);

  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
    return raw.slice(0, 10);
  }

  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) {
    return raw.slice(0, 10);
  }

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

function isInRange(date: string, start: string, end: string) {
  if (!date) return false;
  if (start && date < start) return false;
  if (end && date > end) return false;
  return true;
}

function isClosedStatus(value: unknown) {
  const status = String(value || "");

  return (
    status === "CLOSED" ||
    status.includes("종결") ||
    status.includes("완료") ||
    status.includes("입금완료") ||
    status.includes("환불")
  );
}

function getStaffName(row: any, contract: any) {
  return (
    contract.primary_manager_name ||
    contract.manager_name ||
    row.manager_name ||
    row.profiles?.name ||
    "미지정"
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const start = searchParams.get("start") || "";
    const end = searchParams.get("end") || "";

    const { rows } = await getContractRows();

    const normalizedRows = (rows || []).map((row: any) => {
      const contract = row.lead_contracts?.[0] || {};

      const contractDate = toDateOnly(
        contract.contract_date || contract.created_at || row.created_at
      );

      const settlementDate = toDateOnly(
        contract.settlement_date ||
          contract.closed_at ||
          contract.completed_at ||
          contract.updated_at ||
          row.created_at
      );

      const status = contract.status || row.status || "";

      return {
        id: row.id,
        case_type: "교통사고",
        client_name: row.name || row.client_name || "-",
        phone: row.phone || "-",
        staff_name: getStaffName(row, contract),
        status,
        contract_date: contractDate,
        settlement_date: settlementDate,
        final_settlement_amount: toNumber(
          contract.final_settlement_amount ||
            contract.settlement_amount ||
            contract.total_settlement ||
            contract.final_amount
        ),
        fee_amount: toNumber(
          contract.fee_amount ||
            contract.success_fee ||
            contract.commission_amount
        ),
        detail_href: `/admin/leads/${row.id}`,
        is_closed:
          isClosedStatus(status) ||
          Boolean(
            contract.closed_at ||
              contract.settlement_date ||
              contract.completed_at
          ),
      };
    });

    const filteredRows =
      start || end
        ? normalizedRows.filter((row: any) => {
            return (
              isInRange(row.contract_date, start, end) ||
              isInRange(row.settlement_date, start, end)
            );
          })
        : normalizedRows;

    return NextResponse.json({
      ok: true,
      rows: filteredRows,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "자동 정산 조회 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}