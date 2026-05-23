"use client";

export function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: React.ReactNode; onClose: () => void }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-black text-white">{title}</h3>
        <button type="button" onClick={onClose} className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-800 hover:text-white">닫기</button>
      </div>
      {children}
    </div>
  </div>;
}
