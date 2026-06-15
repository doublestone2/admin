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
import type { LeadCategory } from "@/types";

type LeadCreateButtonProps = {
  staffNames: string[];
  category?: LeadCategory;
  title?: string;
};

const CATEGORY_LABEL: Record<LeadCategory, string> = {
  traffic: "교통사고",
  recovery: "개인회생",
  civil: "민사",
  criminal: "형사",
  etc: "기타",
};

export function LeadCreateButton({
  staffNames,
  category = "traffic",
  title,
}: LeadCreateButtonProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const categoryLabel = CATEGORY_LABEL[category] || "DB";
  const modalTitle = title || `${categoryLabel} DB 추가`;

  function submit(formData: FormData) {
    formData.set("category", category);

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

      <Modal open={open} onClose={() => setOpen(false)} title={modalTitle}>
        <form action={submit} className="grid gap-3">
          <input type="hidden" name="category" value={category} />

          <input className="input" name="name" placeholder="이름" />

          <input className="input" name="phone" placeholder="전화번호" />

          {category === "traffic" ? (
            <>
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
            </>
          ) : null}

          {category === "recovery" ? (
            <>
              <input
                className="input"
                name="debt_amount"
                placeholder="채무금액"
              />

              <input
                className="input"
                name="job_income"
                placeholder="직업 / 소득"
              />

              <input className="input" name="region" placeholder="거주지역" />

              <textarea
                className="input min-h-24"
                name="case_summary"
                placeholder="상담 내용"
              />
            </>
          ) : null}

          {category === "civil" ? (
            <>
              <input
                className="input"
                name="case_type"
                placeholder="사건유형"
              />

              <input
                className="input"
                name="claim_amount"
                placeholder="청구금액"
              />

              <input
                className="input"
                name="opposing_party"
                placeholder="상대방"
              />

              <textarea
                className="input min-h-24"
                name="case_summary"
                placeholder="사건 내용"
              />
            </>
          ) : null}

          {category === "criminal" ? (
            <>
              <input
                className="input"
                name="case_type"
                placeholder="사건유형"
              />

              <select className="input" name="criminal_position">
                <option value="">피의자 / 피해자 선택</option>
                <option value="피의자">피의자</option>
                <option value="피해자">피해자</option>
                <option value="참고인">참고인</option>
                <option value="기타">기타</option>
              </select>

              <select className="input" name="case_stage">
                <option value="">진행단계 선택</option>
                <option value="경찰">경찰</option>
                <option value="검찰">검찰</option>
                <option value="법원">법원</option>
                <option value="수사 전">수사 전</option>
                <option value="기타">기타</option>
              </select>

              <input
                className="input"
                name="opposing_party"
                placeholder="상대방 / 고소인 / 피고소인"
              />

              <textarea
                className="input min-h-24"
                name="case_summary"
                placeholder="사건 내용"
              />
            </>
          ) : null}

          {category === "etc" ? (
            <>
              <input
                className="input"
                name="case_type"
                placeholder="사건유형"
              />

              <textarea
                className="input min-h-24"
                name="case_summary"
                placeholder="상담 내용"
              />
            </>
          ) : null}

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