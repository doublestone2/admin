"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/common/Modal";
import type { LeadCategory } from "@/types";

type ContractItem = {
  id?: string;
  category?: LeadCategory | null;
  designated_fee_rate?: string | null;
  settlement_amount?: number | string | null;
  fee_amount?: number | string | null;
  primary_manager_name?: string | null;
  secondary_manager_name?: string | null;
  memo?: string | null;
};

type ContractRowForButton = {
  id: string;
  category: LeadCategory | null;
  lead_contracts: ContractItem[];
};

type ContractManageButtonProps = {
  row: ContractRowForButton;
  staffNames: string[];
};

const CATEGORY_LABEL: Record<LeadCategory, string> = {
  traffic: "교통사고",
  recovery: "개인회생",
  civil: "민사",
  criminal: "형사",
  etc: "기타",
};

function getCategoryLabel(category?: LeadCategory | null) {
  return CATEGORY_LABEL[category || "traffic"] || "교통사고";
}

export function ContractManageButton({
  row,
  staffNames,
}: ContractManageButtonProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const contract = row.lead_contracts?.[0];
  const category = row.category || "traffic";
  const categoryLabel = getCategoryLabel(category);

  function submit(formData: FormData) {
    const payload = {
      lead_id: row.id,
      category,
      primary_manager_name: String(formData.get("primary_manager_name") || ""),
      secondary_manager_name: String(
        formData.get("secondary_manager_name") || ""
      ),
      designated_fee_rate: String(formData.get("designated_fee_rate") || ""),
      settlement_amount: String(formData.get("settlement_amount") || ""),
      fee_amount: String(formData.get("fee_amount") || ""),
      memo: String(formData.get("memo") || ""),
    };

    startTransition(async () => {
      const res = await fetch("/api/contracts/upsert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result.ok) {
        setOpen(false);
        setMsg("저장되었습니다.");
        router.refresh();
        return;
      }

      setMsg(result.error ?? "저장 중 오류가 발생했습니다.");
    });
  }

  return (
    <>
      <button
        className="btn btn-secondary"
        type="button"
        onClick={() => setOpen(true)}
      >
        계약관리
      </button>

      {msg ? <p className="mt-2 text-xs text-slate-500">{msg}</p> : null}

      <Modal open={open} onClose={() => setOpen(false)} title="계약관리">
        <form action={submit} className="grid gap-3">
          <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-300">
            카테고리: <b className="text-white">{categoryLabel}</b>
          </div>

          <select
            className="input"
            name="primary_manager_name"
            defaultValue={contract?.primary_manager_name || ""}
          >
            <option value="">1차 담당자명 선택</option>
            {staffNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <select
            className="input"
            name="secondary_manager_name"
            defaultValue={contract?.secondary_manager_name || ""}
          >
            <option value="">2차 담당자명 선택</option>
            {staffNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <input
            className="input"
            name="designated_fee_rate"
            defaultValue={contract?.designated_fee_rate || ""}
            placeholder="지정 수수료율 예: 20"
          />

          <input
            className="input"
            name="settlement_amount"
            defaultValue={contract?.settlement_amount || ""}
            placeholder="합의금 / 수임료 예: 1,000,000"
          />

          <input
            className="input"
            name="fee_amount"
            defaultValue={contract?.fee_amount || ""}
            placeholder="수수료 예: 200,000"
          />

          <textarea
            className="input min-h-24"
            name="memo"
            defaultValue={contract?.memo || ""}
            placeholder="메모"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setOpen(false)}
            >
              취소
            </button>

            <button className="btn btn-primary" type="submit" disabled={pending}>
              {pending ? "처리 중..." : "확인"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
