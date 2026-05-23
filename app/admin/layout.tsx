import { requireAuth } from "@/lib/auth/get-profile";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAuth();
  return <div className="flex min-h-screen bg-slate-950">
    <Sidebar profile={profile}/>
    <div className="min-w-0 flex-1">
      <Topbar profile={profile}/>
      <main className="p-4 lg:p-6">{children}</main>
    </div>
  </div>;
}
