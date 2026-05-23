"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function StaffDeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!confirm("직원계정을 삭제할까요?")) return;

    setPending(true);

    const res = await fetch(`/api/staff/${id}`, {
      method: "DELETE",
    });

    const result = await res.json();

    setPending(false);

    if (!result.ok) {
      alert(result.error || "직원계정 삭제 중 오류가 발생했습니다.");
      return;
    }

    alert("직원계정이 삭제되었습니다.");
    router.refresh();
  }

  return (
    <button
      type="button"
      className="btn btn-danger"
      onClick={handleDelete}
      disabled={pending}
    >
      {pending ? "삭제 중..." : "삭제"}
    </button>
  );
}