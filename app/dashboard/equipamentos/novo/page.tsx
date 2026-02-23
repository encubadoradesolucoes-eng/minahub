"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { EquipamentoTipo, EquipamentoStatus } from "@/types/database";

const TIPOS: { value: EquipamentoTipo; label: string }[] = [
  { value: "caminhao", label: "Caminhão" },
  { value: "escavadeira", label: "Escavadeira" },
  { value: "perfuratriz", label: "Perfuratriz" },
  { value: "britador", label: "Britador" },
  { value: "gerador", label: "Gerador" },
  { value: "outros", label: "Outros" },
];

export default function NovoEquipamentoPage() {
  const router = useRouter();
  const supabase = createClient();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    codigo: "",
    nome: "",
    tipo: "outros" as EquipamentoTipo,
    marca: "",
    modelo: "",
    ano_fabricacao: "",
    valor_aquisicao: "",
    data_aquisicao: "",
    vida_util_anos: "",
    valor_residual: "",
    consumo_medio_combustivel: "",
    status: "operacional" as EquipamentoStatus,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await supabase.schema("mining_finance").from("equipamentos").insert({
      codigo: form.codigo,
      nome: form.nome,
      tipo: form.tipo,
      marca: form.marca || null,
      modelo: form.modelo || null,
      ano_fabricacao: form.ano_fabricacao ? Number(form.ano_fabricacao) : null,
      valor_aquisicao: form.valor_aquisicao ? Number(form.valor_aquisicao) : null,
      data_aquisicao: form.data_aquisicao || null,
      vida_util_anos: form.vida_util_anos ? Number(form.vida_util_anos) : null,
      valor_residual: form.valor_residual ? Number(form.valor_residual) : null,
      consumo_medio_combustivel: form.consumo_medio_combustivel ? Number(form.consumo_medio_combustivel) : null,
      status: form.status,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push("/dashboard/equipamentos");
    router.refresh();
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/dashboard/equipamentos" className="text-slate-400 hover:text-white text-sm">
          ← Voltar
        </Link>
        <h1 className="text-2xl font-bold text-white mt-2">Novo equipamento</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-700 bg-slate-800/50 p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Código *</label>
            <input
              type="text"
              required
              value={form.codigo}
              onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nome *</label>
            <input
              type="text"
              required
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Tipo</label>
            <select
              value={form.tipo}
              onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as EquipamentoTipo }))}
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white"
            >
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as EquipamentoStatus }))}
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white"
            >
              <option value="operacional">Operacional</option>
              <option value="manutencao">Manutenção</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Marca</label>
            <input
              type="text"
              value={form.marca}
              onChange={(e) => setForm((f) => ({ ...f, marca: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Modelo</label>
            <input
              type="text"
              value={form.modelo}
              onChange={(e) => setForm((f) => ({ ...f, modelo: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Ano fabricação</label>
            <input
              type="number"
              min="1900"
              max="2100"
              value={form.ano_fabricacao}
              onChange={(e) => setForm((f) => ({ ...f, ano_fabricacao: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Data aquisição</label>
            <input
              type="date"
              value={form.data_aquisicao}
              onChange={(e) => setForm((f) => ({ ...f, data_aquisicao: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Valor aquisição</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.valor_aquisicao}
              onChange={(e) => setForm((f) => ({ ...f, valor_aquisicao: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Valor residual</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.valor_residual}
              onChange={(e) => setForm((f) => ({ ...f, valor_residual: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Vida útil (anos)</label>
            <input
              type="number"
              min="1"
              value={form.vida_util_anos}
              onChange={(e) => setForm((f) => ({ ...f, vida_util_anos: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Consumo médio (L/h)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.consumo_medio_combustivel}
              onChange={(e) => setForm((f) => ({ ...f, consumo_medio_combustivel: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white"
            />
          </div>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-mine-600 text-white font-medium hover:bg-mine-500 disabled:opacity-50"
          >
            {loading ? "Salvando…" : "Cadastrar"}
          </button>
          <Link href="/dashboard/equipamentos" className="px-6 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
