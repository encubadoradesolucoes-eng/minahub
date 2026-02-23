import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getActiveEmpresaId } from "@/lib/empresa-ativa";
import { Plus } from "lucide-react";
import type { PlanejamentoMissao } from "@/types/database";

export default async function PlanejamentoPage() {
  const supabase = await createClient();
  const activeEmpresaId = await getActiveEmpresaId();
  let query = supabase
    .schema("mining_finance")
    .from("planejamento_missao")
    .select("id, nome, data_planejamento, toneladas_estimadas, template_nome, projeto_id, projetos(nome, empresa_id)")
    .order("data_planejamento", { ascending: false });
  if (activeEmpresaId) {
    const { data: projetoIds } = await supabase.schema("mining_finance").from("projetos").select("id").eq("empresa_id", activeEmpresaId);
    const ids = (projetoIds || []).map((p: { id: string }) => p.id);
    if (ids.length > 0) query = query.in("projeto_id", ids);
    else query = query.is("projeto_id", null);
  }
  const { data: planos } = await query;

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Planejamento de missão</h1>
        <Link
          href="/dashboard/planejamento/novo"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-mine-600 text-white font-medium hover:bg-mine-500 transition"
        >
          <Plus className="w-5 h-5" />
          Novo planejamento
        </Link>
      </div>

      <p className="text-slate-400 mb-6 max-w-2xl">
        Simule custos logísticos com itens predefinidos (equipamentos, insumos, mão de obra, serviços) ou crie itens
        customizados. Calcule custo total, custo por tonelada, ROI estimado e ponto de equilíbrio. Salve como template
        para reutilizar.
      </p>

      <div className="rounded-xl border border-slate-700 bg-slate-800/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-left text-slate-400">
              <th className="p-3">Nome</th>
              <th className="p-3">Projeto</th>
              <th className="p-3">Data</th>
              <th className="p-3 text-right">Ton. estimadas</th>
              <th className="p-3">Template</th>
              <th className="p-3 w-24"></th>
            </tr>
          </thead>
          <tbody>
            {(planos || []).length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-slate-500 text-center">
                  Nenhum planejamento.{" "}
                  <Link href="/dashboard/planejamento/novo" className="text-mine-400 hover:underline">
                    Criar primeiro planejamento
                  </Link>
                </td>
              </tr>
            ) : (
              (planos || []).map((p: PlanejamentoMissao & { projetos: { nome: string } | null }) => (
                <tr key={p.id} className="border-b border-slate-700/50">
                  <td className="p-3 text-white">{p.nome}</td>
                  <td className="p-3 text-slate-300">{(p.projetos as { nome: string } | null)?.nome ?? "—"}</td>
                  <td className="p-3 text-slate-300">{p.data_planejamento}</td>
                  <td className="p-3 text-right">
                    {p.toneladas_estimadas != null ? Number(p.toneladas_estimadas).toLocaleString("pt-BR") : "—"}
                  </td>
                  <td className="p-3 text-slate-300">{p.template_nome ?? "—"}</td>
                  <td className="p-3">
                    <Link href={`/dashboard/planejamento/${p.id}`} className="text-mine-400 hover:underline text-sm">
                      Abrir
                    </Link>
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
