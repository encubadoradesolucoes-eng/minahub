"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

export function DashboardShell({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:flex w-56 border-r border-slate-800 bg-slate-900/50 flex-col shrink-0">
        {sidebar}
      </aside>
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-56 border-r border-slate-800 bg-slate-900 flex flex-col md:hidden">
            {sidebar}
          </aside>
        </>
      )}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center gap-2 p-3 border-b border-slate-800 bg-slate-900/80">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Abrir menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-semibold text-white">MineHub</span>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
