"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, LayoutDashboard, Car, FileText, Users, Settings, Wallet, Building2, Hospital } from "lucide-react";
import type { Profile } from "@/types";
import { cn } from "@/lib/utils/format";

function Item({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return <Link href={href} className={cn("block rounded-lg px-3 py-2 text-sm font-semibold", active ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800")}>{children}</Link>;
}

export function Sidebar({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(true);
  return (
    <aside className="hidden h-screen w-72 shrink-0 border-r border-slate-800 bg-slate-950/95 p-4 lg:block">
      <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-4">
        <p className="text-xs font-bold text-blue-400">TRAFFIC CRM</p>
        <h1 className="mt-1 text-lg font-black text-white">교통사고 어드민</h1>
        <p className="mt-2 text-xs text-slate-400">{profile.name} · {profile.role}</p>
      </div>
      <nav className="space-y-2">
        <Item href="/admin/dashboard"><span className="flex items-center gap-2"><LayoutDashboard size={16}/>대시보드</span></Item>
        <div>
          <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-bold text-slate-200 hover:bg-slate-800">
            <span className="flex items-center gap-2"><Car size={16}/>교통사고 DB</span>
            <ChevronDown size={16} className={open ? "rotate-180 transition" : "transition"}/>
          </button>
          {open && <div className="mt-1 space-y-1 pl-4">
            <Item href="/admin/leads">DB관리</Item>
            <Item href="/admin/insurance">보험사 DB</Item>
            <Item href="/admin/partners">제휴업체 DB</Item>
            <Item href="/admin/hospitals"><span className="flex items-center gap-2"><Hospital size={14}/>병원 DB</span></Item>
            <Item href="/admin/contracts">계약현황</Item>
          </div>}
        </div>
        <Item href="/admin/settlements"><span className="flex items-center gap-2"><Wallet size={16}/>정산관리</span></Item>
        <Item href="/admin/board"><span className="flex items-center gap-2"><FileText size={16}/>자료공유</span></Item>
        {profile.role === "ADMIN" && <Item href="/admin/staff"><span className="flex items-center gap-2"><Users size={16}/>직원관리</span></Item>}
        {profile.role === "ADMIN" && <Item href="/admin/settings"><span className="flex items-center gap-2"><Settings size={16}/>설정</span></Item>}
        <Item href="/admin/account"><span className="flex items-center gap-2"><Building2 size={16}/>내 계정</span></Item>
      </nav>
    </aside>
  );
}
