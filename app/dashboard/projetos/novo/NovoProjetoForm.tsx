"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { ProjetoInsert, TipoProjeto, ProjetoStatus } from "@/types/database";

const TIPOS: { value: TipoProjeto; label: string }[] = [
  { value: "exploracao", label: "Exploração" },
  { value: "desenvolvimento", label: "Desenvolvimento" },
  { value: "producao", label: "Produção" },
  { value: "reabilitacao", label: "Reabilitação" },
];

const STATUS: { value: ProjetoStatus; label: string }[] = [
  { value: "planejamento", label: "Planejamento" },
  { value: "ativo", label: "Ativo" },
  { value: "pausado", label: "Pausado" },
  { value: "concluido", label: "Concluído" },
];

export default function NovoProjetoForm({ activeEmpresaId }: { activeEmpresaId: string | null }) {
  const router = useRouter();
  const supabase = createClient();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ProjetoInsert>({
    nome: "",
    codigo: "",
    tipo_projeto: null,
    status: "planejamento",
    mineral_principal: "",
    data_inicio: null,
    data_previsao_termino: null,
    area_hectares: null,
    empresa_id: activeEmpresaId ?? null,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const empresaId = activeEmpresaId ?? form.empresa_id;
    if (!empresaId) {
      setError("Nenhuma empresa selecionada. Use o seletor de empresa na barra lateral.");
      return;
    }
    setLoading(true);
    const payload = {
      ...form,
      mineral_principal: form.mineral_principal || null,
      data_inicio: form.data_inicio || null,
      data_previsao_termino: form.data_previsao_termino || null,
      area_hectares: form.area_hectares ?? null,
      empresa_id: empresaId,
    };
    const { error: err } = await supabase
      .schema("mining_finance")
      .from("projetos")
      .insert(payload);
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push("/dashboard/projetos");
    router.refresh();
  }

  return (
    <>
      <div className="mb-8">
        <Link href="/dashboard/projetos" className="text-slate-400 hover:text-white text-sm">
          ← Voltar
        </Link>
        <h1 className="text-2xl font-bold text-white mt-2">Novo projeto</h1>
        {!activeEmpresaId && (
          <p className="text-amber-400 text-sm mt-1">Selecione uma empresa na barra lateral para vincular o projeto.</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-700 bg-slate-800/50 p-6">
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
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Código *</label>
          <input
            type="text"
            required
            value={form.codigo}
            onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))}
            className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white font-mono"
            placeholder="Ex: PRJ-001"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Tipo</label>
            <select
              value={form.tipo_projeto ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, tipo_projeto: (e.target.value || null) as TipoProjeto | null }))
              }
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white"
            >
              <option value="">—</option>
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
              value={form.status ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, status: (e.target.value as ProjetoStatus) || null }))
              }
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white"
            >
              {STATUS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Mineral principal</label>
          <input
            type="text"
            value={form.mineral_principal ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, mineral_principal: e.target.value || null }))}
            className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Data início</label>
            <input
              type="date"
              value={form.data_inicio ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, data_inicio: e.target.value || null }))}
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Previsão término</label>
            <input
              type="date"
              value={form.data_previsao_termino ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, data_previsao_termino: e.target.value || null }))
              }
              className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Área (hectares)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.area_hectares ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, area_hectares: e.target.value ? Number(e.target.value) : null }))
            }
            className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white"
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !activeEmpresaId}
            className="px-6 py-2 rounded-lg bg-mine-600 text-white font-medium hover:bg-mine-500 disabled:opacity-50"
          >
            {loading ? "Salvando…" : "Criar projeto"}
          </button>
          <Link
            href="/dashboard/projetos"
            className="px-6 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </>
  );
}
