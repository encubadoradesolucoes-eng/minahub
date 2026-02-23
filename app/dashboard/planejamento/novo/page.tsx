"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Projeto } from "@/types/database";
import type { ItemPredefinido, CategoriaItemPlano, PlanejamentoMissaoItem } from "@/types/database";
import { Plus, Trash2 } from "lucide-react";

const CATEGORIA_LABEL: Record<CategoriaItemPlano, string> = {
  equipamentos: "Equipamentos",
  insumos: "Insumos",
  mao_de_obra: "Mão de obra",
  servicos: "Serviços",
};

interface LineItem {
  key: string;
  tipo: "predefinido" | "customizado";
  categoria: CategoriaItemPlano;
  item_predefinido_id: string | null;
  nome: string;
  unidade: string;
  quantidade: number;
  custo_unitario: number;
}

function formatBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });
}

export default function NovoPlanejamentoPage() {
  const router = useRouter();
  const supabase = createClient();
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [predefinidos, setPredefinidos] = useState<ItemPredefinido[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    projeto_id: "",
    data_planejamento: new Date().toISOString().slice(0, 10),
    toneladas_estimadas: "",
    preco_tonelada_estimado: "",
    receita_estimada: "",
    template_nome: "",
  });
  const [itens, setItens] = useState<LineItem[]>([]);
  const [proximoKey, setProximoKey] = useState(0);

  useEffect(() => {
    const client = createClient();
    client.schema("mining_finance").from("projetos").select("id, nome, codigo").order("nome").then(({ data }) => setProjetos((data as Projeto[]) || []));
    client.schema("mining_finance").from("itens_predefinidos").select("*").eq("ativo", true).order("categoria").order("nome").then(({ data }) => setPredefinidos((data as ItemPredefinido[]) || []));
  }, []);

  function addPredefinido(item: ItemPredefinido) {
    setItens((prev) => [
      ...prev,
      {
        key: `p-${item.id}-${proximoKey}`,
        tipo: "predefinido",
        categoria: item.categoria,
        item_predefinido_id: item.id,
        nome: item.nome,
        unidade: item.unidade,
        quantidade: 1,
        custo_unitario: Number(item.custo_estimado_default) || 0,
      },
    ]);
    setProximoKey((k) => k + 1);
  }

  function addCustomizado(categoria: CategoriaItemPlano) {
    setItens((prev) => [
      ...prev,
      {
        key: `c-${proximoKey}`,
        tipo: "customizado",
        categoria,
        item_predefinido_id: null,
        nome: "",
        unidade: "un",
        quantidade: 1,
        custo_unitario: 0,
      },
    ]);
    setProximoKey((k) => k + 1);
  }

  function updateItem(key: string, field: keyof LineItem, value: string | number) {
    setItens((prev) => prev.map((i) => (i.key === key ? { ...i, [field]: value } : i)));
  }

  function removeItem(key: string) {
    setItens((prev) => prev.filter((i) => i.key !== key));
  }

  const custoTotal = itens.reduce((s, i) => s + i.quantidade * i.custo_unitario, 0);
  const ton = form.toneladas_estimadas ? Number(form.toneladas_estimadas) : null;
  const custoPorTon = ton && ton > 0 ? custoTotal / ton : null;
  const receita = form.receita_estimada ? Number(form.receita_estimada) : form.preco_tonelada_estimado && ton ? Number(form.preco_tonelada_estimado) * ton : null;
  const roi = receita != null && custoTotal > 0 ? ((receita - custoTotal) / custoTotal) * 100 : null;
  const precoTon = form.preco_tonelada_estimado ? Number(form.preco_tonelada_estimado) : null;
  const pontoEquilibrio = precoTon && precoTon > 0 ? custoTotal / precoTon : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { data: plano, error: errInsert } = await supabase
      .schema("mining_finance")
      .from("planejamento_missao")
      .insert({
        nome: form.nome,
        descricao: form.descricao || null,
        projeto_id: form.projeto_id || null,
        data_planejamento: form.data_planejamento,
        toneladas_estimadas: form.toneladas_estimadas ? Number(form.toneladas_estimadas) : null,
        preco_tonelada_estimado: form.preco_tonelada_estimado ? Number(form.preco_tonelada_estimado) : null,
        receita_estimada: form.receita_estimada ? Number(form.receita_estimada) : null,
        template_nome: form.template_nome || null,
      })
      .select("id")
      .single();

    if (errInsert || !plano) {
      setLoading(false);
      setError(errInsert?.message ?? "Erro ao criar planejamento");
      return;
    }

    if (itens.length > 0) {
      const rows = itens
        .filter((i) => i.nome.trim() !== "")
        .map((item, idx) => ({
          planejamento_id: plano.id,
          tipo: item.tipo,
          categoria: item.categoria,
          item_predefinido_id: item.item_predefinido_id,
          nome: item.nome,
          unidade: item.unidade,
          quantidade: item.quantidade,
          custo_unitario: item.custo_unitario,
          ordem: idx,
        }));
      await supabase.schema("mining_finance").from("planejamento_missao_itens").insert(rows);
    }

    setLoading(false);
    router.push(`/dashboard/planejamento/${plano.id}`);
    router.refresh();
  }

  const porCategoria = (cat: CategoriaItemPlano) => predefinidos.filter((p) => p.categoria === cat);

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <div className="mb-8">
        <Link href="/dashboard/planejamento" className="text-slate-400 hover:text-white text-sm">
          ← Voltar
        </Link>
        <h1 className="text-2xl font-bold text-white mt-2">Novo planejamento de missão</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Dados do plano */}
        <section className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Dados do plano</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">Nome do planejamento *</label>
              <input
                type="text"
                required
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white"
                placeholder="Ex: Missão Q1 - Frente Norte"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Projeto</label>
              <select
                value={form.projeto_id}
                onChange={(e) => setForm((f) => ({ ...f, projeto_id: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white"
              >
                <option value="">Nenhum</option>
                {projetos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} ({p.codigo})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Data do planejamento</label>
              <input
                type="date"
                value={form.data_planejamento}
                onChange={(e) => setForm((f) => ({ ...f, data_planejamento: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Toneladas estimadas</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.toneladas_estimadas}
                onChange={(e) => setForm((f) => ({ ...f, toneladas_estimadas: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white"
                placeholder="Para custo/ton"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Preço por tonelada (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.preco_tonelada_estimado}
                onChange={(e) => setForm((f) => ({ ...f, preco_tonelada_estimado: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white"
                placeholder="Para ROI e ponto de equilíbrio"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Receita estimada (R$) – opcional</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.receita_estimada}
                onChange={(e) => setForm((f) => ({ ...f, receita_estimada: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">Salvar como template (nome)</label>
              <input
                type="text"
                value={form.template_nome}
                onChange={(e) => setForm((f) => ({ ...f, template_nome: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white"
                placeholder="Ex: Modelo missão padrão"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1">Descrição</label>
              <textarea
                value={form.descricao}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                rows={2}
                className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white"
              />
            </div>
          </div>
        </section>

        {/* Itens predefinidos: adicionar ao plano */}
        <section className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Itens predefinidos</h2>
          <p className="text-slate-400 text-sm mb-4">Clique para adicionar ao plano. Ajuste quantidade e custo unitário na tabela abaixo.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(["equipamentos", "insumos", "mao_de_obra", "servicos"] as CategoriaItemPlano[]).map((cat) => (
              <div key={cat} className="rounded-lg bg-slate-900/80 p-3 border border-slate-700">
                <h3 className="text-sm font-medium text-mine-400 mb-2">{CATEGORIA_LABEL[cat]}</h3>
                <ul className="space-y-1">
                  {porCategoria(cat).map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => addPredefinido(item)}
                        className="text-left w-full text-sm text-slate-300 hover:text-white py-1 px-2 rounded hover:bg-slate-800"
                      >
                        + {item.nome}
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => addCustomizado(cat)}
                  className="mt-2 text-xs text-mine-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Novo item customizado
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Tabela de itens + totais */}
        <section className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Itens do plano</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-left text-slate-400">
                  <th className="p-2">Categoria</th>
                  <th className="p-2">Nome</th>
                  <th className="p-2 w-20">Un.</th>
                  <th className="p-2 w-24">Qtd</th>
                  <th className="p-2 w-28">Custo un.</th>
                  <th className="p-2 w-28 text-right">Total</th>
                  <th className="p-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {itens.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-slate-500">
                      Adicione itens predefinidos acima ou crie itens customizados.
                    </td>
                  </tr>
                ) : (
                  itens.map((item) => (
                    <tr key={item.key} className="border-b border-slate-700/50">
                      <td className="p-2 text-slate-300">{CATEGORIA_LABEL[item.categoria]}</td>
                      <td className="p-2">
                        {item.tipo === "predefinido" ? (
                          item.nome
                        ) : (
                          <input
                            type="text"
                            value={item.nome}
                            onChange={(e) => updateItem(item.key, "nome", e.target.value)}
                            className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-600 text-white text-sm"
                            placeholder="Nome"
                          />
                        )}
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={item.unidade}
                          onChange={(e) => updateItem(item.key, "unidade", e.target.value)}
                          className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-600 text-white text-sm"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.quantidade}
                          onChange={(e) => updateItem(item.key, "quantidade", e.target.value ? Number(e.target.value) : 0)}
                          className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-600 text-white text-sm"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.custo_unitario}
                          onChange={(e) => updateItem(item.key, "custo_unitario", e.target.value ? Number(e.target.value) : 0)}
                          className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-600 text-white text-sm"
                        />
                      </td>
                      <td className="p-2 text-right text-slate-200">
                        {formatBRL(item.quantidade * item.custo_unitario)}
                      </td>
                      <td className="p-2">
                        <button
                          type="button"
                          onClick={() => removeItem(item.key)}
                          className="text-slate-400 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Bloco de cálculos */}
          <div className="mt-6 p-4 rounded-lg bg-slate-900 border border-slate-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wide">Custo total</p>
              <p className="text-xl font-semibold text-white">{formatBRL(custoTotal)}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wide">Custo por tonelada</p>
              <p className="text-xl font-semibold text-mine-400">
                {custoPorTon != null ? formatBRL(custoPorTon) : "—"}
              </p>
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

        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-mine-600 text-white font-medium hover:bg-mine-500 disabled:opacity-50"
          >
            {loading ? "Salvando…" : "Criar planejamento"}
          </button>
          <Link href="/dashboard/planejamento" className="px-6 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
