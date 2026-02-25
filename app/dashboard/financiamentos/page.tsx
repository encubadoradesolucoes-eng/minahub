import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getActiveEmpresaId } from "@/lib/empresa-ativa";
import { Plus } from "lucide-react";

const TIPO_LABEL: Record<string, string> = {
  equity: "Equity",
  debenture: "Debênture",
  project_finance: "Project Finance",
  streaming: "Streaming",
  royalty: "Royalty",
  offtake_pre_pagamento: "Offtake pré-pagamento",
};

export default async function FinanciamentosPage() {
  const supabase = await createClient();
  const activeEmpresaId = await getActiveEmpresaId();
  let query = supabase
    .schema("mining_finance")
    .from("vw_financiamentos_status")
    .select("id, projeto_id, projeto_nome, tipo, fonte_recursos, valor_total, total_amortizado, percentual_pago, parcelas_atrasadas");
  if (activeEmpresaId) {
    const { data: projetoIds } = await supabase.schema("mining_finance").from("projetos").select("id").eq("empresa_id", activeEmpresaId);
    const ids = (projetoIds || []).map((p: { id: string }) => p.id);
    if (ids.length > 0) query = query.in("projeto_id", ids);
  }
  const { data: rows } = await query;

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Financiamentos</h1>
        <Link
          href="/dashboard/financiamentos/novo"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-mine-600 text-white font-medium hover:bg-mine-500 transition"
        >
          <Plus className="w-5 h-5" />
          Novo financiamento
        </Link>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-left text-slate-400">
              <th className="p-3">Projeto</th>
              <th className="p-3">Provedor / Fonte</th>
              <th className="p-3">Tipo</th>
              <th className="p-3 text-right">Valor total</th>
              <th className="p-3 text-right">Amortizado</th>
              <th className="p-3 text-right">% pago</th>
              <th className="p-3 text-right">Atrasos</th>
            </tr>
          </thead>
          <tbody>
            {(rows || []).length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-slate-500 text-center">
                  Nenhum financiamento cadastrado.
                </td>
              </tr>
            ) : (
              (rows || []).map((r: { id: string; projeto_nome: string; tipo: string; fonte_recursos: string; valor_total: number; total_amortizado: number; percentual_pago: number; parcelas_atrasadas: number }) => (
                <tr key={r.id} className="border-b border-slate-700/50">
                  <td className="p-3 text-white">{r.projeto_nome}</td>
                  <td className="p-3 text-slate-300">{r.fonte_recursos || "—"}</td>
                  <td className="p-3 text-slate-300">{TIPO_LABEL[r.tipo] ?? r.tipo}</td>
                  <td className="p-3 text-right">
                    {Number(r.valor_total).toLocaleString("pt-MZ", { style: "currency", currency: "MZN" })}
                  </td>
                  <td className="p-3 text-right">
                    {Number(r.total_amortizado).toLocaleString("pt-MZ", { style: "currency", currency: "MZN" })}
                  </td>
                  <td className="p-3 text-right">{Number(r.percentual_pago).toFixed(1)}%</td>
                  <td className="p-3 text-right">
                    {r.parcelas_atrasadas > 0 ? (
                      <span className="text-amber-400">{r.parcelas_atrasadas}</span>
                    ) : (
                      "0"
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
