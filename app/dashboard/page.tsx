import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getActiveEmpresaId } from "@/lib/empresa-ativa";
import { AlertTriangle, TrendingUp, Calendar } from "lucide-react";
import type { VwFluxoCaixaComparativo, VwCustoToneladaDiario } from "@/types/database";
import OnboardingChecklist from "./OnboardingChecklist";

export default async function DashboardPage() {
  const supabase = await createClient();
  const activeEmpresaId = await getActiveEmpresaId();

  const today = new Date().toISOString().slice(0, 10);
  const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  let fluxoQuery = supabase
    .schema("mining_finance")
    .from("vw_fluxo_caixa_comparativo")
    .select("*")
    .gte("data_referencia", today)
    .lte("data_referencia", in30Days);
  let custoQuery = supabase
    .schema("mining_finance")
    .from("vw_custo_tonelada_diario")
    .select("*")
    .order("data_extracao", { ascending: false })
    .limit(10);

  if (activeEmpresaId) {
    const { data: projetoIds } = await supabase
      .schema("mining_finance")
      .from("projetos")
      .select("id")
      .eq("empresa_id", activeEmpresaId);
    const ids = (projetoIds || []).map((p: { id: string }) => p.id);
    if (ids.length > 0) {
      fluxoQuery = fluxoQuery.in("projeto_id", ids);
      custoQuery = custoQuery.in("projeto_id", ids);
    }
  }

  const { data: fluxo } = await fluxoQuery;
  const { data: custoDiario } = await custoQuery;

  let countProjetos = 0;
  let countEquipamentos = 0;
  let countExtracao = 0;
  if (activeEmpresaId) {
    const [rProjetos, rEquipamentos, rExtracao] = await Promise.all([
      supabase.schema("mining_finance").from("projetos").select("id", { count: "exact", head: true }).eq("empresa_id", activeEmpresaId),
      supabase.schema("mining_finance").from("equipamentos").select("id", { count: "exact", head: true }),
      (async () => {
        const { data: pIds } = await supabase.schema("mining_finance").from("projetos").select("id").eq("empresa_id", activeEmpresaId);
        const ids = (pIds || []).map((p: { id: string }) => p.id);
        if (ids.length === 0) return { count: 0 };
        return supabase.schema("mining_finance").from("extracao").select("id", { count: "exact", head: true }).in("projeto_id", ids);
      })(),
    ]);
    countProjetos = rProjetos.count ?? 0;
    countEquipamentos = rEquipamentos.count ?? 0;
    countExtracao = (rExtracao as { count?: number })?.count ?? 0;
  }

  const alertas = (fluxo || []).filter(
    (f: VwFluxoCaixaComparativo) => f.saldo_previsto != null && Number(f.saldo_previsto) < 0
  );
  const projetoIds = Array.from(new Set(alertas.map((a: VwFluxoCaixaComparativo) => a.projeto_id)));
  const { data: projetosList } =
    projetoIds.length > 0
      ? await supabase.schema("mining_finance").from("projetos").select("id, nome").in("id", projetoIds)
      : { data: [] };
  const projetoNomePorId = new Map((projetosList || []).map((p: { id: string; nome: string }) => [p.id, p.nome]));

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-6xl">
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

      <OnboardingChecklist
        activeEmpresaId={activeEmpresaId}
        countProjetos={countProjetos}
        countEquipamentos={countEquipamentos}
        countExtracao={countExtracao}
      />

      {alertas.length > 0 && (
        <section className="mb-8 p-4 rounded-xl bg-amber-950/40 border border-amber-800">
          <h2 className="flex items-center gap-2 text-amber-400 font-semibold mb-3">
            <AlertTriangle className="w-5 h-5" />
            Alertas de caixa (próximos 30 dias)
          </h2>
          <ul className="space-y-2">
            {alertas.slice(0, 5).map((a: VwFluxoCaixaComparativo) => (
              <li key={`${a.projeto_id}-${a.data_referencia}`} className="text-sm text-slate-300">
                {(projetoNomePorId.get(a.projeto_id) as string) ?? a.projeto_id} em {a.data_referencia}: saldo previsto{" "}
                <span className="text-amber-400">
                  {Number(a.saldo_previsto).toLocaleString("pt-MZ", { style: "currency", currency: "MZN" })}
                </span>
              </li>
            ))}
          </ul>
          {alertas.length > 5 && (
            <p className="text-slate-500 text-sm mt-2">+ {alertas.length - 5} outros</p>
          )}
        </section>
      )}

      <section className="mb-8 p-6 rounded-xl bg-slate-900 border border-slate-800">
        <h2 className="text-white font-semibold mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-mine-400" />
          Produção Diária (Toneladas Brutas)
        </h2>
        <div className="flex items-end gap-3 h-32 px-2">
          {[450, 600, 300, 800, 950, 400, 500].map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="relative w-full bg-slate-800 rounded-t-md overflow-hidden flex items-end h-full">
                <div
                  className="w-full bg-mine-500/80 group-hover:bg-mine-400 transition-all duration-300"
                  style={{ height: `${(val / 1000) * 100}%` }}
                />
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-mine-400 font-bold">
                  {val}t
                </div>
              </div>
              <span className="text-[10px] text-slate-500 uppercase font-mono">
                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'][i]}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[11px] text-slate-500 italic text-center">
          * Dados meramente ilustrativos no modo simulação.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="flex items-center gap-2 text-slate-200 font-semibold mb-4">
          <TrendingUp className="w-5 h-5" />
          Custo por tonelada (últimos registros)
        </h2>
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[400px]">
            <thead>
              <tr className="border-b border-slate-700 text-left text-slate-400">
                <th className="p-3">Data</th>
                <th className="p-3">Projeto</th>
                <th className="p-3 text-right">Toneladas</th>
                <th className="p-3 text-right">Custo/ton</th>
              </tr>
            </thead>
            <tbody>
              {(custoDiario || []).length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-slate-500">
                    Nenhum dado de extração ainda.{" "}
                    <Link href="/dashboard/extracao" className="text-mine-400 hover:underline">
                      Registrar extração
                    </Link>
                  </td>
                </tr>
              ) : (
                (custoDiario || []).map((r: VwCustoToneladaDiario) => (
                  <tr key={`${r.projeto_id}-${r.data_extracao}`} className="border-b border-slate-700/50">
                    <td className="p-3">{r.data_extracao}</td>
                    <td className="p-3">{r.projeto_nome}</td>
                    <td className="p-3 text-right">{Number(r.total_toneladas).toLocaleString("pt-BR")}</td>
                    <td className="p-3 text-right">
                      {Number(r.custo_medio_por_tonelada).toLocaleString("pt-MZ", {
                        style: "currency",
                        currency: "MZN",
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="flex items-center gap-2 text-slate-200 font-semibold mb-4">
          <Calendar className="w-5 h-5" />
          Acesso rápido
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/projetos"
            className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-slate-200 hover:bg-slate-700 transition"
          >
            Projetos
          </Link>
          <Link
            href="/dashboard/extracao"
            className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-slate-200 hover:bg-slate-700 transition"
          >
            Extração
          </Link>
          <Link
            href="/dashboard/contas-pagar"
            className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-slate-200 hover:bg-slate-700 transition"
          >
            Contas a pagar
          </Link>
          <Link
            href="/dashboard/financiamentos"
            className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-slate-200 hover:bg-slate-700 transition"
          >
            Financiamentos
          </Link>
        </div>
      </section>
    </div>
  );
}
