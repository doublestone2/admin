"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteLeadAction,
  upsertLeadNoteAction,
} from "@/app/admin/leads/actions";
import { Modal } from "@/components/common/Modal";

type LeadRowActionsProps = {
  id: string;
  latestNote?: string | null;
  role: string;
};

export function LeadRowActions({ id, latestNote, role }: LeadRowActionsProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function saveMemo(formData: FormData) {
    startTransition(async () => {
      const result = await upsertLeadNoteAction(formData);

      if (result.ok) {
        setOpen(false);
        setMsg("저장됨");
        router.refresh();
        return;
      }

      setMsg(result.error ?? "오류");
    });
  }

  function del() {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    const formData = new FormData();
    formData.set("id", id);

    startTransition(async () => {
      const result = await deleteLeadAction(formData);

      if (result.ok) {
        setMsg("삭제됨");
        router.refresh();
        return;
      }

      setMsg(result.error ?? "오류");
    });
  }

  return (
    <>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn btn-secondary"
        >
          메모
        </button>

        {role === "ADMIN" ? (
          <button
            type="button"
            onClick={del}
            className="btn btn-danger"
            disabled={pending}
          >
            삭제
          </button>
        ) : null}
      </div>

      {msg ? (
        <p className="mt-2 text-right text-xs text-slate-500">{msg}</p>
      ) : null}

      <Modal open={open} onClose={() => setOpen(false)} title="메모 수정">
        <form action={saveMemo} className="space-y-3">
          <input type="hidden" name="lead_id" value={id} />

          <textarea
            className="input min-h-32"
            name="content"
            defaultValue={latestNote || ""}
          />

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
              {pending ? "처리 중..." : "메모 저장"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}