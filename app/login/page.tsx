import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <section className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <p className="text-sm font-bold text-blue-400">TRAFFIC SETTLEMENT CRM</p>
          <h1 className="mt-2 text-2xl font-black text-white">교통사고 어드민 로그인</h1>
          <p className="mt-2 text-sm text-slate-400">상담 DB와 제휴 관리를 시작합니다.</p>
        </div>
        <Suspense fallback={<div className="text-sm text-slate-400">로그인 화면을 불러오는 중입니다...</div>}>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
