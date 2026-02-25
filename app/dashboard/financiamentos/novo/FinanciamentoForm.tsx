"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Projeto } from "@/types/database";

const TIPOS = [
    { value: "equity", label: "Equity" },
    { value: "debenture", label: "Debênture" },
    { value: "project_finance", label: "Project Finance" },
    { value: "streaming", label: "Streaming" },
    { value: "royalty", label: "Royalty" },
    { value: "offtake_pre_pagamento", label: "Offtake (Pré-pagamento)" },
];

export default function FinanciamentoForm({ projetos }: { projetos: Projeto[] }) {
    const router = useRouter();
    const supabase = createClient();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        projeto_id: "",
        tipo: "project_finance",
        fonte_recursos: "",
        valor_total: "",
        taxa_juros: "",
        prazo_meses: "",
        carencia_meses: "0",
        data_contratacao: new Date().toISOString().slice(0, 10),
        data_primeiro_pagamento: "",
        percentual_producao: "",
        preco_fixo: "",
        garantias: "",
        observacoes: "",
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const { error: err } = await supabase.schema("mining_finance").from("financiamentos").insert({
            projeto_id: form.projeto_id || null,
            tipo: form.tipo,
            fonte_recursos: form.fonte_recursos,
            valor_total: Number(form.valor_total),
            taxa_juros: form.taxa_juros ? Number(form.taxa_juros) : null,
            prazo_meses: form.prazo_meses ? parseInt(form.prazo_meses) : null,
            carencia_meses: form.carencia_meses ? parseInt(form.carencia_meses) : 0,
            data_contratacao: form.data_contratacao || null,
            data_primeiro_pagamento: form.data_primeiro_pagamento || null,
            percentual_producao: form.percentual_producao ? Number(form.percentual_producao) : null,
            preco_fixo: form.preco_fixo ? Number(form.preco_fixo) : null,
            garantias: form.garantias || null,
            observacoes: form.observacoes || null,
        });

        setLoading(false);
        if (err) {
            setError(err.message);
            return;
        }
        router.push("/dashboard/financiamentos");
        router.refresh();
    }

    return (
        <>
            <div className="mb-8">
                <Link href="/dashboard/financiamentos" className="text-slate-400 hover:text-white text-sm">
                    ← Voltar
                </Link>
                <h1 className="text-2xl font-bold text-white mt-2">Novo lançamento: Financiamento</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-slate-700 bg-slate-800/50 p-4 sm:p-6 shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Projeto (opcional)</label>
                        <select
                            value={form.projeto_id}
                            onChange={(e) => setForm((f) => ({ ...f, projeto_id: e.target.value }))}
                            className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white focus:border-mine-500 focus:ring-1 focus:ring-mine-500 transition-all outline-none"
                        >
                            <option value="">Nenhum</option>
                            {projetos.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.nome}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Tipo de Financiamento *</label>
                        <select
                            required
                            value={form.tipo}
                            onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}
                            className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white focus:border-mine-500 focus:ring-1 focus:ring-mine-500 transition-all outline-none"
                        >
                            {TIPOS.map((t) => (
                                <option key={t.value} value={t.value}>
                                    {t.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Fonte de Recursos (Banco/Investidor) *</label>
                    <input
                        type="text"
                        required
                        value={form.fonte_recursos}
                        onChange={(e) => setForm((f) => ({ ...f, fonte_recursos: e.target.value }))}
                        placeholder="Ex: Millennium BIM, Absa Moçambique"
                        className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white focus:border-mine-500 focus:ring-1 focus:ring-mine-500 transition-all outline-none"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Valor Total (MZN) *</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            min="0"
                            value={form.valor_total}
                            onChange={(e) => setForm((f) => ({ ...f, valor_total: e.target.value }))}
                            className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white focus:border-mine-500 focus:ring-1 focus:ring-mine-500 transition-all outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Taxa de Juros (%)</label>
                        <input
                            type="number"
                            step="0.0001"
                            min="0"
                            value={form.taxa_juros}
                            onChange={(e) => setForm((f) => ({ ...f, taxa_juros: e.target.value }))}
                            className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white focus:border-mine-500 focus:ring-1 focus:ring-mine-500 transition-all outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Prazo (Meses)</label>
                        <input
                            type="number"
                            min="0"
                            value={form.prazo_meses}
                            onChange={(e) => setForm((f) => ({ ...f, prazo_meses: e.target.value }))}
                            className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white focus:border-mine-500 focus:ring-1 focus:ring-mine-500 transition-all outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Carência (Meses)</label>
                        <input
                            type="number"
                            min="0"
                            value={form.carencia_meses}
                            onChange={(e) => setForm((f) => ({ ...f, carencia_meses: e.target.value }))}
                            className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white focus:border-mine-500 focus:ring-1 focus:ring-mine-500 transition-all outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Data Contratação</label>
                        <input
                            type="date"
                            value={form.data_contratacao}
                            onChange={(e) => setForm((f) => ({ ...f, data_contratacao: e.target.value }))}
                            className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white focus:border-mine-500 focus:ring-1 focus:ring-mine-500 transition-all outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Data Primeiro Pagamento</label>
                        <input
                            type="date"
                            value={form.data_primeiro_pagamento}
                            onChange={(e) => setForm((f) => ({ ...f, data_primeiro_pagamento: e.target.value }))}
                            className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white focus:border-mine-500 focus:ring-1 focus:ring-mine-500 transition-all outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Percentual de Produção (%)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={form.percentual_producao}
                            onChange={(e) => setForm((f) => ({ ...f, percentual_producao: e.target.value }))}
                            placeholder="Para streaming/royalty"
                            className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white focus:border-mine-500 focus:ring-1 focus:ring-mine-500 transition-all outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Preço Fixo (MZN)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={form.preco_fixo}
                            onChange={(e) => setForm((f) => ({ ...f, preco_fixo: e.target.value }))}
                            placeholder="Para offtake"
                            className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white focus:border-mine-500 focus:ring-1 focus:ring-mine-500 transition-all outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Garantias</label>
                    <textarea
                        value={form.garantias}
                        onChange={(e) => setForm((f) => ({ ...f, garantias: e.target.value }))}
                        rows={2}
                        className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white focus:border-mine-500 focus:ring-1 focus:ring-mine-500 transition-all outline-none"
                    />
                </div>

                {error && (
                    <div className="p-4 rounded-lg bg-red-900/20 border border-red-900/50 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <div className="flex flex-wrap gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-2.5 rounded-lg bg-mine-600 text-white font-bold hover:bg-mine-500 disabled:opacity-50 shadow-lg shadow-mine-900/20 transition-all active:scale-95"
                    >
                        {loading ? "Salvando…" : "Registrar financiamento"}
                    </button>
                    <Link
                        href="/dashboard/financiamentos"
                        className="px-8 py-2.5 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 transition-all"
                    >
                        Cancelar
                    </Link>
                </div>
            </form>
        </>
    );
}
