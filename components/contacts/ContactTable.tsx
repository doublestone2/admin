"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createContactAction,
  deleteContactAction,
  updateContactAction,
} from "@/app/admin/contacts/actions";
import { Modal } from "@/components/common/Modal";
import {
  CONTRACT_STATUS_OPTIONS,
  HOSPITAL_TYPES,
  PARTNERSHIP_STATUS_OPTIONS,
} from "@/lib/utils/constants";
import { formatKSTDateTime } from "@/lib/utils/date";

type Kind = "insurance" | "partner" | "hospital";

type ContactTableProps = {
  kind: Kind;
  rows: any[];
  staffNames: string[];
  role: string;
};

export function ContactTable({
  kind,
  rows,
  staffNames,
  role,
}: ContactTableProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<any | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const base =
    kind === "insurance"
      ? "/admin/insurance"
      : kind === "partner"
        ? "/admin/partners"
        : "/admin/hospitals";

  const title =
    kind === "insurance"
      ? "보험사"
      : kind === "partner"
        ? "제휴업체"
        : "병원";

  function handleOpenCreate() {
    setMsg(null);
    setEdit(null);
    setOpen(true);
  }

  function handleOpenEdit(row: any) {
    setMsg(null);
    setEdit(row);
    setOpen(true);
  }

  function handleCloseModal() {
    setOpen(false);
    setEdit(null);
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = edit
        ? await updateContactAction(kind, formData)
        : await createContactAction(kind, formData);

      if (result.ok) {
        setOpen(false);
        setEdit(null);
        setMsg("저장되었습니다.");
        return;
      }

      setMsg(result.error ?? "저장에 실패했습니다.");
    });
  }

  function handleDelete(id: string) {
    if (!window.confirm("삭제할까요?")) return;

    const formData = new FormData();
    formData.set("id", id);

    startTransition(async () => {
      const result = await deleteContactAction(kind, formData);

      setMsg(
        result.ok
          ? "삭제되었습니다."
          : result.error ?? "삭제에 실패했습니다."
      );
    });
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button
          className="btn btn-primary"
          type="button"
          onClick={handleOpenCreate}
        >
          {title} 추가
        </button>
      </div>

      {msg ? (
        <p className="mb-3 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-300">
          {msg}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              {kind === "insurance" ? (
                <>
                  <th className="p-3 text-left">등록일</th>
                  <th className="p-3 text-left">보험사</th>
                  <th className="p-3 text-left">담당자</th>
                  <th className="p-3 text-left">직급</th>
                  <th className="p-3 text-left">전화번호</th>
                  <th className="p-3 text-left">메모</th>
                </>
              ) : null}

              {kind === "partner" ? (
                <>
                  <th className="p-3 text-left">등록일</th>
                  <th className="p-3 text-left">업체명</th>
                  <th className="p-3 text-left">지역</th>
                  <th className="p-3 text-left">연락처</th>
                  <th className="p-3 text-left">계약여부</th>
                  <th className="p-3 text-left">담당자</th>
                  <th className="p-3 text-left">메모</th>
                </>
              ) : null}

              {kind === "hospital" ? (
                <>
                  <th className="p-3 text-left">등록일</th>
                  <th className="p-3 text-left">병원명</th>
                  <th className="p-3 text-left">지역</th>
                  <th className="p-3 text-left">유형</th>
                  <th className="p-3 text-left">제휴상태</th>
                  <th className="p-3 text-left">담당자</th>
                  <th className="p-3 text-left">메모</th>
                </>
              ) : null}

              <th className="p-3 text-right">액션</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {rows.length === 0 ? (
              <tr>
                <td
                  className="p-6 text-center text-sm text-slate-500"
                  colSpan={8}
                >
                  등록된 데이터가 없습니다.
                </td>
              </tr>
            ) : null}

            {rows.map((row: any) => (
              <tr
                key={row.id}
                className="table-row-clickable cursor-pointer hover:bg-slate-900/70"
                onClick={() => router.push(`${base}/${row.id}`)}
              >
                {kind === "insurance" ? (
                  <>
                    <td className="p-3 text-slate-400">
                      {formatKSTDateTime(row.created_at)}
                    </td>
                    <td className="p-3 font-bold text-white">
                      {row.insurance_company}
                    </td>
                    <td className="p-3">{row.manager_name || "-"}</td>
                    <td className="p-3">{row.position || "-"}</td>
                    <td className="p-3">{row.phone || "-"}</td>
                    <td className="max-w-xs truncate p-3 text-slate-400">
                      {row.memo || "-"}
                    </td>
                  </>
                ) : null}

                {kind === "partner" ? (
                  <>
                    <td className="p-3 text-slate-400">
                      {formatKSTDateTime(row.created_at)}
                    </td>
                    <td className="p-3 font-bold text-white">
                      {row.company_name}
                    </td>
                    <td className="p-3">{row.region || "-"}</td>
                    <td className="p-3">{row.phone || "-"}</td>
                    <td className="p-3">{row.contract_status || "-"}</td>
                    <td className="p-3">{row.manager_name || "-"}</td>
                    <td className="max-w-xs truncate p-3 text-slate-400">
                      {row.memo || "-"}
                    </td>
                  </>
                ) : null}

                {kind === "hospital" ? (
                  <>
                    <td className="p-3 text-slate-400">
                      {formatKSTDateTime(row.created_at)}
                    </td>
                    <td className="p-3 font-bold text-white">
                      {row.hospital_name}
                    </td>
                    <td className="p-3">{row.region || "-"}</td>
                    <td className="p-3">{row.hospital_type || "-"}</td>
                    <td className="p-3">{row.partnership_status || "-"}</td>
                    <td className="p-3">
                      {row.internal_manager_name || "-"}
                    </td>
                    <td className="max-w-xs truncate p-3 text-slate-400">
                      {row.memo || "-"}
                    </td>
                  </>
                ) : null}

                <td className="p-3 text-right">
                  <button
                    className="btn btn-secondary mr-2"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleOpenEdit(row);
                    }}
                  >
                    수정
                  </button>

                  {role === "ADMIN" ? (
                    <button
                      className="btn btn-danger"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDelete(row.id);
                      }}
                    >
                      삭제
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={open}
        onClose={handleCloseModal}
        title={`${title} ${edit ? "수정" : "추가"}`}
      >
        <form action={handleSubmit} className="grid gap-3">
          <input type="hidden" name="id" value={edit?.id || ""} />

          {kind === "insurance" ? (
            <>
              <input
                className="input"
                name="insurance_company"
                defaultValue={edit?.insurance_company || ""}
                placeholder="보험사명"
              />

              <input
                className="input"
                name="manager_name"
                defaultValue={edit?.manager_name || ""}
                placeholder="담당자 이름"
              />

              <input
                className="input"
                name="position"
                defaultValue={edit?.position || ""}
                placeholder="직급"
              />

              <input
                className="input"
                name="phone"
                defaultValue={edit?.phone || ""}
                placeholder="전화번호"
              />
            </>
          ) : null}

          {kind === "partner" ? (
            <>
              <input
                className="input"
                name="company_name"
                defaultValue={edit?.company_name || ""}
                placeholder="업체명"
              />

              <input
                className="input"
                name="region"
                defaultValue={edit?.region || ""}
                placeholder="지역"
              />

              <input
                className="input"
                name="phone"
                defaultValue={edit?.phone || ""}
                placeholder="연락처"
              />

              <select
                className="input"
                name="contract_status"
                defaultValue={edit?.contract_status || "미계약"}
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
                defaultValue={edit?.manager_name || ""}
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
                defaultValue={edit?.hospital_name || ""}
                placeholder="병원명"
              />

              <input
                className="input"
                name="region"
                defaultValue={edit?.region || ""}
                placeholder="지역"
              />

              <select
                className="input"
                name="hospital_type"
                defaultValue={edit?.hospital_type || "기타"}
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
                defaultValue={edit?.manager_name || ""}
                placeholder="담당자 이름"
              />

              <input
                className="input"
                name="position"
                defaultValue={edit?.position || ""}
                placeholder="직급/부서"
              />

              <input
                className="input"
                name="phone"
                defaultValue={edit?.phone || ""}
                placeholder="연락처"
              />

              <select
                className="input"
                name="partnership_status"
                defaultValue={edit?.partnership_status || "미접촉"}
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
                defaultValue={edit?.internal_manager_name || ""}
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
            defaultValue={edit?.memo || ""}
            placeholder="메모"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCloseModal}
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