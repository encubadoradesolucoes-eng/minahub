"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { DashboardShell } from "./DashboardShell";
import type { LicencaStatus } from "@/lib/saas";

const SETUP_PATHS = ["/dashboard/cadastro-completo", "/dashboard/sem-licenca"];

export function DashboardGuard({
  status,
  children,
  sidebar,
}: {
  status: LicencaStatus;
  children: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isSetupPath = SETUP_PATHS.some((p) => pathname?.startsWith(p));

  useEffect(() => {
    if (isSetupPath) return;
    if (!status.hasEmpresa) {
      router.replace("/dashboard/cadastro-completo");
      return;
    }
    if (!status.hasLicencaAtiva) {
      router.replace("/dashboard/sem-licenca");
      return;
    }
  }, [status.hasEmpresa, status.hasLicencaAtiva, isSetupPath, router]);

  async function handleSignOut() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (isSetupPath) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950">
        <header className="border-b border-slate-800 p-4 flex items-center justify-between shrink-0">
          <Link href="/dashboard/cadastro-completo" className="text-lg font-bold text-mine-400">
            MineHub
          </Link>
          <button type="button" onClick={handleSignOut} className="text-slate-400 hover:text-white text-sm">
            Sair
          </button>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-auto">{children}</main>
      </div>
    );
  }

  if (!status.hasEmpresa || !status.hasLicencaAtiva) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <p className="text-slate-400">Redirecionando…</p>
      </div>
    );
  }

  return (
    <DashboardShell sidebar={sidebar}>
      {children}
    </DashboardShell>
  );
}
