"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type SettlementRow = {
  id: string;
  case_type: string;
  client_name: string;
  phone: string;
  staff_name: string;
  status: string;
  contract_date: string;
  settlement_date: string;
  final_settlement_amount: number;
  fee_amount: number;
  detail_href: string;
  is_closed: boolean;
};

function getKstMonthRange() {
  const now = new Date();
  const kst = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const y = kst.getFullYear();
  const m = kst.getMonth();

  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 0);

  const format = (date: Date) => {
    const yy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yy}-${mm}-${dd}`;
  };

  return {
    start: format(start),
    end: format(end),
  };
}

function money(value: number) {
  return `${Math.round(Number(value || 0)).toLocaleString("ko-KR")}원`;
}

function inRange(date: string, start: string, end: string) {
  if (!date) return false;
  if (start && date < start) return false;
  if (end && date > end) return false;
  return true;
}

export function AutoSettlementManager() {
  const monthRange = getKstMonthRange();

  const [startDate, setStartDate] = useState(monthRange.start);
  const [endDate, setEndDate] = useState(monthRange.end);
  const [rows, setRows] = useState<SettlementRow[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function loadRows() {
    setPending(true);
    setMsg(null);

    const res = await fetch(
      `/api/settlements/auto?start=${startDate}&end=${endDate}`
    );

    const result = await res.json();

    setPending(false);

    if (!result.ok) {
      setMsg(result.error || "정산 조회 중 오류가 발생했습니다.");
      return;
    }

    setRows(result.rows || []);
  }

  useEffect(() => {
    loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const summary = useMemo(() => {
    const contractRows = rows.filter((row) =>
      inRange(row.contract_date, startDate, endDate)
    );

    const closedRows = rows.filter(
      (row) => row.is_closed && inRange(row.settlement_date, startDate, endDate)
    );

    const totalSettlement = closedRows.reduce(
      (sum, row) => sum + Number(row.final_settlement_amount || 0),
      0
    );

    const totalFee = closedRows.reduce(
      (sum, row) => sum + Number(row.fee_amount || 0),
      0
    );

    const staffMap = new Map<
      string,
      {
        staff_name: string;
        contract_count: number;
        closed_count: number;
        total_settlement: number;
        total_fee: number;
      }
    >();

    rows.forEach((row) => {
      const name = row.staff_name || "미지정";

      if (!staffMap.has(name)) {
        staffMap.set(name, {
          staff_name: name,
          contract_count: 0,
          closed_count: 0,
          total_settlement: 0,
          total_fee: 0,
        });
      }

      const item = staffMap.get(name)!;

      if (inRange(row.contract_date, startDate, endDate)) {
        item.contract_count += 1;
      }

      if (row.is_closed && inRange(row.settlement_date, startDate, endDate)) {
        item.closed_count += 1;
        item.total_settlement += Number(row.final_settlement_amount || 0);
        item.total_fee += Number(row.fee_amount || 0);
      }
    });

    return {
      contract_count: contractRows.length,
      closed_count: closedRows.length,
      total_settlement: totalSettlement,
      total_fee: totalFee,
      staff: Array.from(staffMap.values()),
      closedRows,
    };
  }, [rows, startDate, endDate]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">정산관리</h1>
        <p className="mt-1 text-sm text-slate-400">
          DB관리에서 계약·종결 처리된 데이터를 자동으로 집계합니다.
        </p>
      </div>

      <section className="card p-5">
        <h2 className="text-lg font-black text-white">조회 기간</h2>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <input
            type="date"
            className="input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <input
            type="date"
            className="input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          <button
            type="button"
            className="btn btn-primary"
            onClick={loadRows}
            disabled={pending}
          >
            조회
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              const range = getKstMonthRange();
              setStartDate(range.start);
              setEndDate(range.end);
            }}
            disabled={pending}
          >
            이번 달
          </button>
        </div>
      </section>

      {msg && (
        <p className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-slate-200">
          {msg}
        </p>
      )}

      <section className="grid gap-3 md:grid-cols-4">
        <div className="card p-5">
          <p className="text-sm text-slate-400">계약수</p>
          <p className="mt-2 text-2xl font-black text-white">
            {summary.contract_count.toLocaleString("ko-KR")}건
          </p>
        </div>

        <div className="card p-5">
          <p className="text-sm text-slate-400">종결수</p>
          <p className="mt-2 text-2xl font-black text-white">
            {summary.closed_count.toLocaleString("ko-KR")}건
          </p>
        </div>

        <div className="card p-5">
          <p className="text-sm text-slate-400">총 합의금</p>
          <p className="mt-2 text-2xl font-black text-white">
            {money(summary.total_settlement)}
          </p>
        </div>

        <div className="card p-5">
          <p className="text-sm text-slate-400">총 수수료</p>
          <p className="mt-2 text-2xl font-black text-white">
            {money(summary.total_fee)}
          </p>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="text-lg font-black text-white">직원별 수수료</h2>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-900 text-slate-400">
              <tr>
                <th className="p-3 text-left">직원명</th>
                <th className="p-3 text-right">계약 건수</th>
                <th className="p-3 text-right">종결 건수</th>
                <th className="p-3 text-right">총 합의금</th>
                <th className="p-3 text-right">총 수수료</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {summary.staff.map((staff) => (
                <tr key={staff.staff_name}>
                  <td className="p-3 font-semibold text-white">
                    {staff.staff_name}
                  </td>
                  <td className="p-3 text-right">{staff.contract_count}건</td>
                  <td className="p-3 text-right">{staff.closed_count}건</td>
                  <td className="p-3 text-right">
                    {money(staff.total_settlement)}
                  </td>
                  <td className="p-3 text-right">{money(staff.total_fee)}</td>
                </tr>
              ))}

              {summary.staff.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-slate-500">
                    조회된 정산 내역이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card p-5">
        <h2 className="text-lg font-black text-white">종결된 DB</h2>

        <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-900 text-slate-400">
              <tr>
                <th className="p-3 text-left">종결일</th>
                <th className="p-3 text-left">구분</th>
                <th className="p-3 text-left">고객명</th>
                <th className="p-3 text-left">연락처</th>
                <th className="p-3 text-left">담당자</th>
                <th className="p-3 text-right">합의금</th>
                <th className="p-3 text-right">수수료</th>
                <th className="p-3 text-right">상세</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {summary.closedRows.map((row) => (
                <tr key={row.id}>
                  <td className="p-3">{row.settlement_date || "-"}</td>
                  <td className="p-3">{row.case_type}</td>
                  <td className="p-3 font-semibold text-white">
                    {row.client_name}
                  </td>
                  <td className="p-3">{row.phone || "-"}</td>
                  <td className="p-3">{row.staff_name || "-"}</td>
                  <td className="p-3 text-right">
                    {money(row.final_settlement_amount)}
                  </td>
                  <td className="p-3 text-right">{money(row.fee_amount)}</td>
                  <td className="p-3 text-right">
                    <Link href={row.detail_href} className="btn btn-secondary">
                      상세보기
                    </Link>
                  </td>
                </tr>
              ))}

              {summary.closedRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-slate-500">
                    해당 기간에 종결된 DB가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}