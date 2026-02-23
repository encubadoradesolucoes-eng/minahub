"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Projeto } from "@/types/database";
import type { Turno } from "@/types/database";

const TURNO_OPTIONS: { value: Turno; label: string }[] = [
  { value: "manha", label: "Manhã" },
  { value: "tarde", label: "Tarde" },
  { value: "noite", label: "Noite" },
];

export default function NovaExtracaoForm({ projetos }: { projetos: Projeto[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    projeto_id: "",
    data_extracao: new Date().toISOString().slice(0, 10),
    turno: "manha" as Turno,
    frente_trabalho: "",
    toneladas_brutas: "",
    teor_medio: "",
    custo_operacional: "",
    custo_combustivel: "",
    custo_manutencao: "",
    observacoes: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await supabase.schema("mining_finance").from("extracao").insert({
      projeto_id: form.projeto_id,
      data_extracao: form.data_extracao,
      turno: form.turno,
      frente_trabalho: form.frente_trabalho || null,
      toneladas_brutas: Number(form.toneladas_brutas),
      teor_medio: form.teor_medio ? Number(form.teor_medio) : null,
      custo_operacional: form.custo_operacional ? Number(form.custo_operacional) : null,
      custo_combustivel: form.custo_combustivel ? Number(form.custo_combustivel) : null,
      custo_manutencao: form.custo_manutencao ? Number(form.custo_manutencao) : null,
      observacoes: form.observacoes || null,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push("/dashboard/extracao");
    router.refresh();
  }

  return (
    <>
      <div className="mb-8">
        <Link href="/dashboard/extracao" className="text-slate-400 hover:text-white text-sm">
          ← Voltar
        </Link>
        <h1 className="text-2xl font-bold text-white mt-2">Nova extração</h1>
        {projetos.length === 0 && (
          <p className="text-amber-400 text-sm mt-1">Crie um projeto na empresa ativa para registrar extrações.</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-700 bg-slate-800/50 p-4 sm:p-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Projeto *</label>
          <select
            required
            value={form.projeto_id}
            onChange={(e) => setForm((f) => ({ ...f, projeto_id: e.target.value }))}
            className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white"
          >
            <option value="">Selecione</option>
            {projetos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome} ({p.codigo})
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Data *</label>
            <input
              type="date"
              required
              value={form.data_extracao}
              onChange={(e) => setForm((f) => ({ ...f, data_extracao: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Turno</label>
            <select
              value={form.turno}
              onChange={(e) => setForm((f) => ({ ...f, turno: e.target.value as Turno }))}
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white"
            >
              {TURNO_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Frente de trabalho</label>
          <input
            type="text"
            value={form.frente_trabalho}
            onChange={(e) => setForm((f) => ({ ...f, frente_trabalho: e.target.value }))}
            className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Toneladas brutas *</label>
            <input
              type="number"
              step="0.01"
              required
              min="0"
              value={form.toneladas_brutas}
              onChange={(e) => setForm((f) => ({ ...f, toneladas_brutas: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Teor médio %</label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={form.teor_medio}
              onChange={(e) => setForm((f) => ({ ...f, teor_medio: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Custo operacional</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.custo_operacional}
              onChange={(e) => setForm((f) => ({ ...f, custo_operacional: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Custo combustível</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.custo_combustivel}
              onChange={(e) => setForm((f) => ({ ...f, custo_combustivel: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Custo manutenção</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.custo_manutencao}
              onChange={(e) => setForm((f) => ({ ...f, custo_manutencao: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Observações</label>
          <textarea
            value={form.observacoes}
            onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
            rows={2}
            className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white"
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={loading || projetos.length === 0}
            className="px-6 py-2 rounded-lg bg-mine-600 text-white font-medium hover:bg-mine-500 disabled:opacity-50"
          >
            {loading ? "Salvando…" : "Registrar extração"}
          </button>
          <Link href="/dashboard/extracao" className="px-6 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800">
            Cancelar
          </Link>
        </div>
      </form>
    </>
  );
}
