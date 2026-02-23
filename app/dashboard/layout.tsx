import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getLicencaStatus } from "@/lib/saas";
import { resolveActiveEmpresaId } from "@/lib/empresa-ativa";
import { DashboardGuard } from "./DashboardGuard";
import { EmpresaSelector } from "./EmpresaSelector";
import { LayoutDashboard, FolderKanban, Truck, Fuel, Wallet, FileText, Target, User, CreditCard, LogOut } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const licenca = await getLicencaStatus();
  const cookieStore = await cookies();
  const activeEmpresaId = resolveActiveEmpresaId(cookieStore, licenca.empresas);
  const empresaAtiva = licenca.empresas.find((e) => e.id === activeEmpresaId);
  const licencaAtivaEmpresa = empresaAtiva?.licenca_ativa;

  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
  }

  const nav = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/projetos", label: "Projetos", icon: FolderKanban },
    { href: "/dashboard/extracao", label: "Extração", icon: Truck },
    { href: "/dashboard/equipamentos", label: "Equipamentos", icon: Fuel },
    { href: "/dashboard/contas-pagar", label: "Contas a pagar", icon: Wallet },
    { href: "/dashboard/contas-receber", label: "Contas a receber", icon: Wallet },
    { href: "/dashboard/financiamentos", label: "Financiamentos", icon: FileText },
    { href: "/dashboard/planejamento", label: "Planejamento de missão", icon: Target },
    { href: "/dashboard/conta", label: "Minha conta", icon: User },
    { href: "/dashboard/renovar", label: "Planos / Renovar", icon: CreditCard },
  ];

  const sidebar = (
    <aside className="w-56 border-r border-slate-800 bg-slate-900/50 flex flex-col">
      <div className="p-4 border-b border-slate-800">
        <Link href="/dashboard" className="text-lg font-bold text-mine-400">MineHub</Link>
      </div>
      <nav className="flex-1 p-2 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="text-sm">{label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-2 border-t border-slate-800">
        <EmpresaSelector empresas={licenca.empresas} activeEmpresaId={activeEmpresaId} />
        {empresaAtiva && licencaAtivaEmpresa && (
          <div className="px-3 py-1.5 text-xs text-mine-500">
            {(licencaAtivaEmpresa as { plano: string; data_fim: string }).plano} · até {(licencaAtivaEmpresa as { data_fim: string }).data_fim}
          </div>
        )}
        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition text-sm"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </form>
      </div>
    </aside>
  );

  return (
    <DashboardGuard status={licenca} sidebar={sidebar}>
      {children}
    </DashboardGuard>
  );
}
