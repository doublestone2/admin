import { requireAuth } from "@/lib/auth/get-profile";
import { PageHeader } from "@/components/common/PageHeader";
import { changePasswordAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function Account() {
  const p = await requireAuth();

  async function handleChangePassword(formData: FormData): Promise<void> {
    "use server";
    await changePasswordAction(formData);
  }

  return (
    <>
      <PageHeader
        title="내 계정"
        description="로그인 정보와 비밀번호를 관리합니다."
      />

      <section className="card p-5">
        <h2 className="font-black text-white">계정 정보</h2>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <p>이름: {p.name}</p>
          <p>로그인ID: {p.login_id || "-"}</p>
          <p>이메일: {p.email || p.auth_email || "-"}</p>
          <p>권한: {p.role}</p>
        </div>
      </section>

      <section className="card mt-6 p-5">
        <h2 className="font-black text-white">비밀번호 변경</h2>

        <form action={handleChangePassword} className="mt-4 grid max-w-lg gap-3">
          <input
            className="input"
            type="password"
            name="current_password"
            placeholder="현재 비밀번호"
          />

          <input
            className="input"
            type="password"
            name="new_password"
            placeholder="새 비밀번호"
          />

          <input
            className="input"
            type="password"
            name="confirm_password"
            placeholder="새 비밀번호 확인"
          />

          <button className="btn btn-primary" type="submit">
            변경
          </button>
        </form>
      </section>
    </>
  );
}