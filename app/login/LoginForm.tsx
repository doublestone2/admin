"use client";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { loginAction } from "./actions";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    formData.set("next", searchParams.get("next") || "/admin/dashboard");
    startTransition(async () => {
      const res = await loginAction(formData);
      if (res && !res.ok) setError(res.error);
    });
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-300">이메일 또는 로그인ID</label>
        <input className="input" name="identifier" placeholder="이메일 또는 로그인ID 입력" autoComplete="username" />
      </div>
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-300">비밀번호</label>
        <input className="input" name="password" type="password" placeholder="비밀번호 입력" autoComplete="current-password" />
      </div>
      {error && <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}
      <button className="btn btn-primary w-full" disabled={pending}>{pending ? "로그인 중..." : "로그인"}</button>
    </form>
  );
}
