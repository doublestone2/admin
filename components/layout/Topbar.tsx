import { logoutAction } from "@/app/admin/actions";
import type { Profile } from "@/types";
import { MobileNav } from "./MobileNav";

export function Topbar({ profile }: { profile: Profile }) {
  return <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950/90 px-4 backdrop-blur lg:px-6">
    <MobileNav profile={profile}/>
    <div className="hidden lg:block">
      <p className="text-sm font-bold text-white">교통사고 합의대행 CRM</p>
      <p className="text-xs text-slate-500">서울시간 기준 실무 관리 시스템</p>
    </div>
    <form action={logoutAction}><button className="btn btn-secondary" type="submit">로그아웃</button></form>
  </header>;
}
