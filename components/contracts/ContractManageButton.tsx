"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertContractAction } from "@/app/admin/contracts/actions";
import { Modal } from "@/components/common/Modal";
import type { ContractRow } from "@/lib/data/contracts";
import type { Profile } from "@/types";

type ContractManageButtonProps = {
  row: ContractRow;
  profiles: Profile[];
  staffNames: string[];
};

export function ContractManageButton({
  row,
  profiles,
  staffNames,
}: ContractManageButtonProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const contract = row.lead_contracts?.[0];

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await upsertContractAction(formData);

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
          <input type="hidden" name="lead_id" value={row.id} />

          <select
            className="input"
            name="primary_manager_id"
            defaultValue={contract?.primary_manager_id || ""}
          >
            <option value="">1차 담당자 계정 선택</option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name || profile.email || profile.id}
              </option>
            ))}
          </select>

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
            name="secondary_manager_id"
            defaultValue={contract?.secondary_manager_id || ""}
          >
            <option value="">2차 담당자 계정 선택</option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name || profile.email || profile.id}
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
            placeholder="합의금 예: 1,000,000"
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