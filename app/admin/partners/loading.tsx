export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 animate-pulse rounded bg-slate-800" />

      <div className="grid gap-3 md:grid-cols-4">
        <div className="h-24 animate-pulse rounded-xl bg-slate-900" />
        <div className="h-24 animate-pulse rounded-xl bg-slate-900" />
        <div className="h-24 animate-pulse rounded-xl bg-slate-900" />
        <div className="h-24 animate-pulse rounded-xl bg-slate-900" />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800">
        <div className="h-12 animate-pulse bg-slate-900" />
        <div className="h-14 animate-pulse border-t border-slate-800 bg-slate-950" />
        <div className="h-14 animate-pulse border-t border-slate-800 bg-slate-950" />
        <div className="h-14 animate-pulse border-t border-slate-800 bg-slate-950" />
        <div className="h-14 animate-pulse border-t border-slate-800 bg-slate-950" />
        <div className="h-14 animate-pulse border-t border-slate-800 bg-slate-950" />
      </div>
    </div>
  );
}
