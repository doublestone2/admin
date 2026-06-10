"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createLeadAction } from "@/app/admin/leads/actions";
import { Modal } from "@/components/common/Modal";
import {
  CONTACT_METHODS,
  LEAD_STATUSES,
  LEAD_STATUS_LABEL,
} from "@/lib/utils/constants";

type LeadCreateButtonProps = {
  staffNames: string[];
};

export function LeadCreateButton({ staffNames }: LeadCreateButtonProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await createLeadAction(formData);

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
      <div className="mb-4 flex justify-end">
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => setOpen(true)}
        >
          추가
        </button>
      </div>

      {msg ? (
        <p className="mb-3 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-300">
          {msg}
        </p>
      ) : null}

      <Modal open={open} onClose={() => setOpen(false)} title="교통사고 DB 추가">
        <form action={submit} className="grid gap-3">
          <input className="input" name="name" placeholder="이름" />

          <input className="input" name="phone" placeholder="전화번호" />

          <select className="input" name="contact_method">
            {CONTACT_METHODS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>

          <input
            className="input"
            name="insurance_company"
            placeholder="상대 보험사"
          />

          <select className="input" name="status" defaultValue="NEW">
            {LEAD_STATUSES.map((value) => (
              <option key={value} value={value}>
                {LEAD_STATUS_LABEL[value]}
              </option>
            ))}
          </select>

          <select className="input" name="manager_name">
            <option value="">담당자명 선택</option>
            {staffNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <textarea className="input min-h-24" name="memo" placeholder="메모" />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setOpen(false)}
            >
              취소
            </button>

            <button
              className="btn btn-primary"
              type="submit"
              disabled={pending}
            >
              {pending ? "처리 중..." : "확인"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}