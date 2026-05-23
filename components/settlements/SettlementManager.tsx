"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type SettlementRow = {
  id: string;
  case_type: string;
  client_name: string;
  phone?: string | null;
  staff_name: string;
  contract_date?: string | null;
  settlement_date: string;
  status: string;
  final_settlement_amount: number;
  fee_amount: number;
  memo?: string | null;
};

type FormState = {
  id?: string;
  case_type: string;
  client_name: string;
  phone: string;
  staff_name: string;
  contract_date: string;
  settlement_date: string;
  status: string;
  final_settlement_amount: string;
  fee_amount: string;
  memo: string;
};

function getKstToday() {
  const now = new Date();
  const kst = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const y = kst.getFullYear();
  const m = String(kst.getMonth() + 1).padStart(2, "0");
  const d = String(kst.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

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

function makeEmptyForm(): FormState {
  return {
    case_type: "교통사고",
    client_name: "",
    phone: "",
    staff_name: "",
    contract_date: "",
    settlement_date: getKstToday(),
    status: "종결",
    final_settlement_amount: "",
    fee_amount: "",
    memo: "",
  };
}

export function SettlementManager() {
  const monthRange = getKstMonthRange();

  const [startDate, setStartDate] = useState(monthRange.start);
  const [endDate, setEndDate] = useState(monthRange.end);
  const [rows, setRows] = useState<SettlementRow[]>([]);
  const [form, setForm] = useState<FormState>(makeEmptyForm());
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function loadRows() {
    setPending(true);
    setMsg(null);

    const res = await fetch(`/api/settlements?start=${startDate}&end=${endDate}`);
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
    const contractRows = rows.filter((row) => row.status !== "환불");
    const closedRows = rows.filter((row) => row.status === "종결");

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

      if (row.status !== "환불") {
        item.contract_count += 1;
      }

      if (row.status === "종결") {
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
  }, [rows]);

  function updateForm(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function startEdit(row: SettlementRow) {
    setForm({
      id: row.id,
      case_type: row.case_type || "교통사고",
      client_name: row.client_name || "",
      phone: row.phone || "",
      staff_name: row.staff_name || "",
      contract_date: row.contract_date || "",
      settlement_date: row.settlement_date || getKstToday(),
      status: row.status || "종결",
      final_settlement_amount: String(row.final_settlement_amount || ""),
      fee_amount: String(row.fee_amount || ""),
      memo: row.memo || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.client_name.trim()) {
      setMsg("고객명을 입력해주세요.");
      return;
    }

    if (!form.staff_name.trim()) {
      setMsg("담당자를 입력해주세요.");
      return;
    }

    if (!form.settlement_date) {
      setMsg("종결일 또는 정산일을 선택해주세요.");
      return;
    }

    setPending(true);
    setMsg(null);

    const url = form.id ? `/api/settlements/${form.id}` : "/api/settlements";
    const method = form.id ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const result = await res.json();

    setPending(false);

    if (!result.ok) {
      setMsg(result.error || "저장 중 오류가 발생했습니다.");
      return;
    }

    setMsg(form.id ? "정산 내역이 수정되었습니다." : "정산 내역이 추가되었습니다.");
    setForm(makeEmptyForm());
    await loadRows();
  }

  async function remove(id: string) {
    if (!confirm("정산 내역을 삭제할까요?")) return;

    setPending(true);
    setMsg(null);

    const res = await fetch(`/api/settlements/${id}`, {
      method: "DELETE",
    });

    const result = await res.json();

    setPending(false);

    if (!result.ok) {
      setMsg(result.error || "삭제 중 오류가 발생했습니다.");
      return;
    }

    setMsg("정산 내역이 삭제되었습니다.");
    await loadRows();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">정산관리</h1>
        <p className="mt-1 text-sm text-slate-400">
          기간별 계약, 종결, 합의금, 수수료를 관리합니다.
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
        <h2 className="text-lg font-black text-white">
          {form.id ? "정산 내역 수정" : "정산 내역 추가"}
        </h2>

        <form onSubmit={submit} className="mt-4 grid gap-3 md:grid-cols-3">
          <select
            className="input"
            value={form.case_type}
            onChange={(e) => updateForm("case_type", e.target.value)}
          >
            <option value="교통사고">교통사고</option>
            <option value="불법사채">불법사채</option>
            <option value="개인회생">개인회생</option>
            <option value="기타">기타</option>
          </select>

          <input
            className="input"
            placeholder="고객명"
            value={form.client_name}
            onChange={(e) => updateForm("client_name", e.target.value)}
          />

          <input
            className="input"
            placeholder="연락처"
            value={form.phone}
            onChange={(e) => updateForm("phone", e.target.value)}
          />

          <input
            className="input"
            placeholder="담당자"
            value={form.staff_name}
            onChange={(e) => updateForm("staff_name", e.target.value)}
          />

          <input
            type="date"
            className="input"
            value={form.contract_date}
            onChange={(e) => updateForm("contract_date", e.target.value)}
          />

          <input
            type="date"
            className="input"
            value={form.settlement_date}
            onChange={(e) => updateForm("settlement_date", e.target.value)}
          />

          <select
            className="input"
            value={form.status}
            onChange={(e) => updateForm("status", e.target.value)}
          >
            <option value="계약">계약</option>
            <option value="종결">종결</option>
            <option value="환불">환불</option>
          </select>

          <input
            className="input"
            placeholder="총 합의금"
            value={form.final_settlement_amount}
            onChange={(e) =>
              updateForm("final_settlement_amount", e.target.value)
            }
          />

          <input
            className="input"
            placeholder="총 수수료"
            value={form.fee_amount}
            onChange={(e) => updateForm("fee_amount", e.target.value)}
          />

          <textarea
            className="input min-h-24 md:col-span-3"
            placeholder="메모"
            value={form.memo}
            onChange={(e) => updateForm("memo", e.target.value)}
          />

          <div className="flex justify-end gap-2 md:col-span-3">
            {form.id && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setForm(makeEmptyForm())}
              >
                수정 취소
              </button>
            )}

            <button className="btn btn-primary" disabled={pending}>
              {form.id ? "수정 저장" : "정산 추가"}
            </button>
          </div>
        </form>
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
                <th className="p-3 text-left">메모</th>
                <th className="p-3 text-right">관리</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {summary.closedRows.map((row) => (
                <tr key={row.id}>
                  <td className="p-3">{row.settlement_date}</td>
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
                  <td className="max-w-xs truncate p-3 text-slate-400">
                    {row.memo || "-"}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      className="btn btn-secondary mr-2"
                      onClick={() => startEdit(row)}
                    >
                      수정
                    </button>
                    <button className="btn btn-danger" onClick={() => remove(row.id)}>
                      삭제
                    </button>
                  </td>
                </tr>
              ))}

              {summary.closedRows.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-4 text-center text-slate-500">
                    종결된 정산 내역이 없습니다.
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