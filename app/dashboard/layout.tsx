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

  const role = user?.user_metadata?.role || "admin";

  const nav = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, role: "any" },
    { href: "/dashboard/financeiro", label: "Financeiro", icon: Wallet, role: "admin" },
    { href: "/dashboard/projetos", label: "Projetos", icon: FolderKanban, role: "gerente" },
    { href: "/dashboard/extracao", label: "Extração", icon: Truck, role: "operador" },
    { href: "/dashboard/equipamentos", label: "Equipamentos", icon: Fuel, role: "operador" },
    { href: "/dashboard/contas-pagar", label: "Contas a pagar", icon: Wallet, role: "admin" },
    { href: "/dashboard/contas-receber", label: "Contas a receber", icon: Wallet, role: "admin" },
    { href: "/dashboard/financiamentos", label: "Financiamentos", icon: FileText, role: "admin" },
    { href: "/dashboard/planejamento", label: "Planejamento de missão", icon: Target, role: "gerente" },
    { href: "/dashboard/relatorios", label: "Relatórios", icon: FileText, role: "gerente" },
    { href: "/dashboard/conta", label: "Minha conta", icon: User, role: "any" },
    { href: "/dashboard/renovar", label: "Planos / Renovar", icon: CreditCard, role: "admin" },
  ];

  const filteredNav = nav.filter(item => {
    if (item.role === "any") return true;
    if (role === "admin") return true;
    if (role === "gerente") return item.role !== "admin";
    if (role === "operador") return item.role === "operador";
    return false;
  });

  async function signOutAction() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/");
  }

  const sidebar = (
    <aside className="w-56 border-r border-slate-800 bg-slate-900/50 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-800">
        <Link href="/dashboard" className="text-lg font-bold text-mine-400">MineHub</Link>
      </div>
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {filteredNav.map(({ href, label, icon: Icon }) => (
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
      <div className="p-2 border-t border-slate-800 bg-slate-950/20">
        <EmpresaSelector empresas={licenca.empresas} activeEmpresaId={activeEmpresaId} />
        {empresaAtiva && licencaAtivaEmpresa && (
          <div className="px-3 py-1.5 text-[10px] text-mine-500 font-medium truncate uppercase tracking-tighter">
            {(licencaAtivaEmpresa as any).plano} · até {(licencaAtivaEmpresa as any).data_fim}
          </div>
        )}
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition text-sm"
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
