"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import type { Profile } from "@/types";

export function MobileNav({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false);

  const links = [
    ["/admin/dashboard", "대시보드"],
    ["/admin/leads", "교통사고 DB관리"],
    ["/admin/insurance", "보험사 DB"],
    ["/admin/partners", "제휴업체 DB"],
    ["/admin/hospitals", "병원 DB"],
    ["/admin/recovery", "개인회생"],
    ["/admin/civil", "민사"],
    ["/admin/criminal", "형사"],
    ["/admin/etc", "기타"],
    ["/admin/contracts", "계약현황"],
    ["/admin/settlements", "정산관리"],
    ["/admin/board", "자료공유"],
    ["/admin/account", "내 계정"],
  ];

  if (profile.role === "ADMIN") {
    links.splice(12, 0, ["/admin/staff", "직원관리"]);
  }

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="btn btn-secondary"
      >
        <Menu size={16} />
        메뉴
      </button>

      {open ? (
        <div className="absolute left-4 right-4 top-16 z-50 rounded-xl border border-slate-700 bg-slate-950 p-3 shadow-xl">
          <div className="mb-3 text-sm text-slate-400">
            {profile.name} · {profile.role}
          </div>

          <div className="grid gap-1">
            {links.map(([href, label]) => (
              <Link
                key={href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-bold text-slate-200 hover:bg-slate-800"
                href={href}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}