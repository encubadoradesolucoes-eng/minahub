import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { PlanejamentoMissao, PlanejamentoMissaoItem } from "@/types/database";

const CATEGORIA_LABEL: Record<string, string> = {
  equipamentos: "Equipamentos",
  insumos: "Insumos",
  mao_de_obra: "Mão de obra",
  servicos: "Serviços",
};

function formatBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
}

export default async function PlanejamentoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: plano, error: errPlano } = await supabase
    .schema("mining_finance")
    .from("planejamento_missao")
    .select("*, projetos(nome, codigo)")
    .eq("id", id)
    .single();

  if (errPlano || !plano) notFound();

  const { data: itens } = await supabase
    .schema("mining_finance")
    .from("planejamento_missao_itens")
    .select("*")
    .eq("planejamento_id", id)
    .order("ordem");

  const p = plano as PlanejamentoMissao & { projetos: { nome: string; codigo: string } | null };
  const lista = (itens || []) as PlanejamentoMissaoItem[];
  const custoTotal = lista.reduce((s, i) => s + Number(i.custo_total), 0);
  const ton = p.toneladas_estimadas ? Number(p.toneladas_estimadas) : null;
  const custoPorTon = ton && ton > 0 ? custoTotal / ton : null;
  const receita = p.receita_estimada != null ? Number(p.receita_estimada) : p.preco_tonelada_estimado && ton ? Number(p.preco_tonelada_estimado) * ton : null;
  const roi = receita != null && custoTotal > 0 ? ((receita - custoTotal) / custoTotal) * 100 : null;
  const precoTon = p.preco_tonelada_estimado ? Number(p.preco_tonelada_estimado) : null;
  const pontoEquilibrio = precoTon && precoTon > 0 ? custoTotal / precoTon : null;

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <div className="mb-8">
        <Link href="/dashboard/planejamento" className="text-slate-400 hover:text-white text-sm">
          ← Voltar ao planejamento
        </Link>
        <h1 className="text-2xl font-bold text-white mt-2">{p.nome}</h1>
        <p className="text-slate-400 text-sm mt-1">
          {(p.projetos as { nome: string; codigo: string } | null)?.nome ?? "Sem projeto"} · {p.data_planejamento}
          {p.template_nome && ` · Template: ${p.template_nome}`}
        </p>
        {p.descricao && <p className="text-slate-300 mt-2">{p.descricao}</p>}
      </div>

      <section className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Cálculos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wide">Custo total</p>
            <p className="text-xl font-semibold text-white">{formatBRL(custoTotal)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wide">Custo por tonelada</p>
            <p className="text-xl font-semibold text-mine-400">{custoPorTon != null ? formatBRL(custoPorTon) : "—"}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wide">ROI estimado</p>
            <p className={`text-xl font-semibold ${roi != null ? (roi >= 0 ? "text-mine-400" : "text-amber-400") : "text-slate-500"}`}>
              {roi != null ? `${roi.toFixed(1)}%` : "—"}
            </p>
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wide">Ponto de equilíbrio (ton)</p>
            <p className="text-xl font-semibold text-slate-200">
              {pontoEquilibrio != null ? pontoEquilibrio.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "—"}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-700 bg-slate-800/50 overflow-hidden">
        <h2 className="text-lg font-semibold text-white p-4 border-b border-slate-700">Itens do plano</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-left text-slate-400">
              <th className="p-3">Categoria</th>
              <th className="p-3">Nome</th>
              <th className="p-3">Un.</th>
              <th className="p-3 text-right">Qtd</th>
              <th className="p-3 text-right">Custo un.</th>
              <th className="p-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-slate-500 text-center">Nenhum item neste plano.</td>
              </tr>
            ) : (
              lista.map((i) => (
                <tr key={i.id} className="border-b border-slate-700/50">
                  <td className="p-3 text-slate-300">{CATEGORIA_LABEL[i.categoria] ?? i.categoria}</td>
                  <td className="p-3 text-white">{i.nome}</td>
                  <td className="p-3 text-slate-300">{i.unidade}</td>
                  <td className="p-3 text-right">{Number(i.quantidade).toLocaleString("pt-BR")}</td>
                  <td className="p-3 text-right">{formatBRL(Number(i.custo_unitario))}</td>
                  <td className="p-3 text-right">{formatBRL(Number(i.custo_total))}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
