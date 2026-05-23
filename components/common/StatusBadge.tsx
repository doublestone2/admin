import { LEAD_STATUS_LABEL } from "@/lib/utils/constants";
import { cn } from "@/lib/utils/format";

export function StatusBadge({ status }: { status?: string | null }) {
  const map: Record<string, string> = {
    NEW: "bg-sky-500/15 text-sky-300 border border-sky-500/30",
    IN_PROGRESS: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
    CONTRACTED: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
    CLOSED: "bg-slate-500/15 text-slate-300 border border-slate-500/30"
  };
  return <span className={cn("badge", map[status || ""] || "bg-slate-700 text-slate-200")}>{LEAD_STATUS_LABEL[status || ""] || status || "-"}</span>;
}
