"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteContactAction,
  updateContactAction,
} from "@/app/admin/contacts/actions";
import { Modal } from "@/components/common/Modal";
import {
  CONTRACT_STATUS_OPTIONS,
  HOSPITAL_TYPES,
  PARTNERSHIP_STATUS_OPTIONS,
} from "@/lib/utils/constants";

type Kind = "insurance" | "partner" | "hospital";

type ContactRowActionsProps = {
  kind: Kind;
  row: any;
  staffNames: string[];
  role: string;
};

function getTitle(kind: Kind) {
  if (kind === "insurance") return "보험사";
  if (kind === "partner") return "제휴업체";
  return "병원";
}

export function ContactRowActions({
  kind,
  row,
  staffNames,
  role,
}: ContactRowActionsProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const title = getTitle(kind);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateContactAction(kind, formData);

      if (result.ok) {
        setOpen(false);
        setMsg("저장되었습니다.");
        router.refresh();
        return;
      }

      setMsg(result.error ?? "저장 중 오류가 발생했습니다.");
    });
  }

  function handleDelete() {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    const formData = new FormData();
    formData.set("id", row.id);

    startTransition(async () => {
      const result = await deleteContactAction(kind, formData);

      if (result.ok) {
        setMsg("삭제되었습니다.");
        router.refresh();
        return;
      }

      setMsg(result.error ?? "삭제 중 오류가 발생했습니다.");
    });
  }

  return (
    <>
      <div className="flex justify-end gap-2">
        <button
          className="btn btn-secondary"
          type="button"
          onClick={() => {
            setMsg(null);
            setOpen(true);
          }}
        >
          수정
        </button>

        {role === "ADMIN" ? (
          <button
            className="btn btn-danger"
            type="button"
            onClick={handleDelete}
            disabled={pending}
          >
            삭제
          </button>
        ) : null}
      </div>

      {msg ? <p className="mt-2 text-right text-xs text-slate-500">{msg}</p> : null}

      <Modal open={open} onClose={() => setOpen(false)} title={`${title} 수정`}>
        <form action={handleSubmit} className="grid gap-3">
          <input type="hidden" name="id" value={row.id} />

          {kind === "insurance" ? (
            <>
              <input
                className="input"
                name="insurance_company"
                defaultValue={row.insurance_company || ""}
                placeholder="보험사명"
              />

              <input
                className="input"
                name="manager_name"
                defaultValue={row.manager_name || ""}
                placeholder="담당자 이름"
              />

              <input
                className="input"
                name="position"
                defaultValue={row.position || ""}
                placeholder="직급"
              />

              <input
                className="input"
                name="phone"
                defaultValue={row.phone || ""}
                placeholder="전화번호"
              />
            </>
          ) : null}

          {kind === "partner" ? (
            <>
              <input
                className="input"
                name="company_name"
                defaultValue={row.company_name || ""}
                placeholder="업체명"
              />

              <input
                className="input"
                name="region"
                defaultValue={row.region || ""}
                placeholder="지역"
              />

              <input
                className="input"
                name="phone"
                defaultValue={row.phone || ""}
                placeholder="연락처"
              />

              <select
                className="input"
                name="contract_status"
                defaultValue={row.contract_status || "미계약"}
              >
                {CONTRACT_STATUS_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>

              <select
                className="input"
                name="manager_name"
                defaultValue={row.manager_name || ""}
              >
                <option value="">담당자 선택</option>
                {staffNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </>
          ) : null}

          {kind === "hospital" ? (
            <>
              <input
                className="input"
                name="hospital_name"
                defaultValue={row.hospital_name || ""}
                placeholder="병원명"
              />

              <input
                className="input"
                name="region"
                defaultValue={row.region || ""}
                placeholder="지역"
              />

              <select
                className="input"
                name="hospital_type"
                defaultValue={row.hospital_type || "기타"}
              >
                {HOSPITAL_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>

              <input
                className="input"
                name="manager_name"
                defaultValue={row.manager_name || ""}
                placeholder="담당자 이름"
              />

              <input
                className="input"
                name="position"
                defaultValue={row.position || ""}
                placeholder="직급/부서"
              />

              <input
                className="input"
                name="phone"
                defaultValue={row.phone || ""}
                placeholder="연락처"
              />

              <select
                className="input"
                name="partnership_status"
                defaultValue={row.partnership_status || "미접촉"}
              >
                {PARTNERSHIP_STATUS_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>

              <select
                className="input"
                name="internal_manager_name"
                defaultValue={row.internal_manager_name || ""}
              >
                <option value="">내부 담당자 선택</option>
                {staffNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </>
          ) : null}

          <textarea
            className="input min-h-24"
            name="memo"
            defaultValue={row.memo || ""}
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