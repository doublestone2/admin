import { PageHeader } from "@/components/common/PageHeader";
import { requireAdmin } from "@/lib/auth/get-profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createStaffAction, updateStaffAction } from "./actions";
import { formatKSTDateTime } from "@/lib/utils/date";
import { StaffDeleteButton } from "@/components/staff/StaffDeleteButton";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const currentProfile = await requireAdmin();

  const supabase = createSupabaseServerClient();

  const { data } = await supabase
  .from("profiles")
  .select(`
    id,
    created_at,
    name,
    login_id,
    email,
    auth_email,
    phone,
    role,
    is_active,
    deleted_at
  `)
  .is("deleted_at", null)
  .order("created_at", { ascending: false })
  .range(0, 99);

  async function handleCreateStaff(formData: FormData): Promise<void> {
    "use server";
    await createStaffAction(formData);
  }

  async function handleUpdateStaff(formData: FormData): Promise<void> {
    "use server";
    await updateStaffAction(formData);
  }

  return (
    <>
      <PageHeader
        title="직원관리"
        description="로그인ID와 비밀번호를 자유롭게 입력해도 내부에서 정규화됩니다."
      />

      <section className="card mb-6 p-5">
        <h2 className="font-black text-white">직원 생성</h2>

        <form
          action={handleCreateStaff}
          className="mt-4 grid gap-3 md:grid-cols-3"
        >
          <input className="input" name="name" placeholder="이름" />

          <input
            className="input"
            name="login_id"
            placeholder="로그인ID 또는 이메일"
          />

          <input className="input" name="password" placeholder="비밀번호" />

          <input className="input" name="phone" placeholder="연락처" />

          <select className="input" name="role" defaultValue="STAFF">
            <option value="STAFF">STAFF</option>
            <option value="ADMIN">ADMIN</option>
          </select>

          <button className="btn btn-primary" type="submit">
            생성
          </button>
        </form>
      </section>

      <section className="card p-5">
        <h2 className="font-black text-white">직원 목록</h2>

        <div className="mt-3 divide-y divide-slate-800">
          {(data || []).map((profile: any) => (
            <form
              action={handleUpdateStaff}
              key={profile.id}
              className="grid gap-2 py-3 md:grid-cols-7 md:items-center"
            >
              <input type="hidden" name="id" value={profile.id} />

              <b>{profile.name}</b>

              <span className="text-sm text-slate-400">
                {profile.login_id || profile.email || profile.auth_email || "-"}
              </span>

              <span className="text-sm text-slate-500">
                {formatKSTDateTime(profile.created_at)}
              </span>

              <select
                className="input"
                name="role"
                defaultValue={profile.role}
              >
                <option value="STAFF">STAFF</option>
                <option value="ADMIN">ADMIN</option>
              </select>

              <label className="flex gap-2 text-sm">
                <input
                  type="checkbox"
                  name="is_active"
                  defaultChecked={profile.is_active}
                />
                활성
              </label>

              <button className="btn btn-secondary" type="submit">
                저장
              </button>

              <div className="flex justify-end">
                {profile.id === currentProfile.id ? (
                  <span className="text-xs text-slate-500">본인 계정</span>
                ) : (
                  <StaffDeleteButton id={profile.id} />
                )}
              </div>
            </form>
          ))}

          {(data || []).length === 0 && (
            <p className="py-6 text-center text-sm text-slate-500">
              등록된 직원이 없습니다.
            </p>
          )}
        </div>
      </section>
    </>
  );
}