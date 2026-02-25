"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Projeto } from "@/types/database";

const STATUS = [
    { value: "emitida", label: "Emitida" },
    { value: "faturada", label: "Faturada" },
    { value: "recebida", label: "Recebida" },
    { value: "cancelada", label: "Cancelada" },
];

export default function ContasReceberForm({ projetos }: { projetos: Projeto[] }) {
    const router = useRouter();
    const supabase = createClient();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        projeto_id: "",
        nota_fiscal: "",
        quantidade_toneladas: "",
        preco_tonelada: "",
        valor_bruto: "",
        data_vencimento: new Date().toISOString().slice(0, 10),
        data_recebimento: "",
        status: "emitida",
    });

    // Atualizar valor bruto automaticamente se qut e preço forem preenchidos
    useEffect(() => {
        const q = Number(form.quantidade_toneladas);
        const p = Number(form.preco_tonelada);
        if (q > 0 && p > 0) {
            setForm((f) => ({ ...f, valor_bruto: (q * p).toString() }));
        }
    }, [form.quantidade_toneladas, form.preco_tonelada]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const { error: err } = await supabase.schema("mining_finance").from("contas_receber").insert({
            projeto_id: form.projeto_id || null,
            nota_fiscal: form.nota_fiscal || null,
            quantidade_toneladas: Number(form.quantidade_toneladas),
            preco_tonelada: Number(form.preco_tonelada),
            valor_bruto: Number(form.valor_bruto),
            data_vencimento: form.data_vencimento,
            data_recebimento: form.data_recebimento || null,
            status: form.status,
        });

        setLoading(false);
        if (err) {
            setError(err.message);
            return;
        }
        router.push("/dashboard/contas-receber");
        router.refresh();
    }

    return (
        <>
            <div className="mb-8">
                <Link href="/dashboard/contas-receber" className="text-slate-400 hover:text-white text-sm">
                    ← Voltar
                </Link>
                <h1 className="text-2xl font-bold text-white mt-2">Novo lançamento: Conta a receber</h1>
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
                        <label className="block text-sm font-medium text-slate-300 mb-1">Nota Fiscal (NF)</label>
                        <input
                            type="text"
                            value={form.nota_fiscal}
                            onChange={(e) => setForm((f) => ({ ...f, nota_fiscal: e.target.value }))}
                            placeholder="Ex: NF-000123"
                            className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white focus:border-mine-500 focus:ring-1 focus:ring-mine-500 transition-all outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Qtd. Toneladas *</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            min="0"
                            value={form.quantidade_toneladas}
                            onChange={(e) => setForm((f) => ({ ...f, quantidade_toneladas: e.target.value }))}
                            className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white focus:border-mine-500 focus:ring-1 focus:ring-mine-500 transition-all outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Preço por Tonelada (MZN) *</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            min="0"
                            value={form.preco_tonelada}
                            onChange={(e) => setForm((f) => ({ ...f, preco_tonelada: e.target.value }))}
                            className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white focus:border-mine-500 focus:ring-1 focus:ring-mine-500 transition-all outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Valor Bruto Total (MZN) *</label>
                        <input
                            type="number"
                            step="0.01"
                            required
                            min="0"
                            value={form.valor_bruto}
                            onChange={(e) => setForm((f) => ({ ...f, valor_bruto: e.target.value }))}
                            className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white focus:border-mine-500 focus:ring-1 focus:ring-mine-500 transition-all outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Data Vencimento *</label>
                        <input
                            type="date"
                            required
                            value={form.data_vencimento}
                            onChange={(e) => setForm((f) => ({ ...f, data_vencimento: e.target.value }))}
                            className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white focus:border-mine-500 focus:ring-1 focus:ring-mine-500 transition-all outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Data Recebimento</label>
                        <input
                            type="date"
                            value={form.data_recebimento}
                            onChange={(e) => setForm((f) => ({ ...f, data_recebimento: e.target.value }))}
                            className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white focus:border-mine-500 focus:ring-1 focus:ring-mine-500 transition-all outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Status *</label>
                    <select
                        value={form.status}
                        onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                        className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white focus:border-mine-500 focus:ring-1 focus:ring-mine-500 transition-all outline-none"
                    >
                        {STATUS.map((s) => (
                            <option key={s.value} value={s.value}>
                                {s.label}
                            </option>
                        ))}
                    </select>
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
                        {loading ? "Salvando…" : "Registrar lançamento"}
                    </button>
                    <Link
                        href="/dashboard/contas-receber"
                        className="px-8 py-2.5 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 transition-all"
                    >
                        Cancelar
                    </Link>
                </div>
            </form>
        </>
    );
}
