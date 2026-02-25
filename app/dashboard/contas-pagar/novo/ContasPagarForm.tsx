"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Projeto } from "@/types/database";

const CATEGORIAS = [
    { value: "combustivel", label: "Combustível" },
    { value: "energia", label: "Energia" },
    { value: "agua", label: "Água" },
    { value: "manutencao", label: "Manutenção" },
    { value: "aluguel", label: "Aluguel" },
    { value: "salarios", label: "Salários" },
    { value: "encargos", label: "Encargos" },
    { value: "frete", label: "Frete" },
    { value: "insumos", label: "Insumos" },
    { value: "servicos_terceiros", label: "Serviços terceiros" },
    { value: "outros", label: "Outros" },
];

const STATUS = [
    { value: "pendente", label: "Pendente" },
    { value: "pago", label: "Pago" },
    { value: "cancelado", label: "Cancelado" },
];

export default function ContasPagarForm({ projetos }: { projetos: Projeto[] }) {
    const router = useRouter();
    const supabase = createClient();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        projeto_id: "",
        descricao: "",
        valor_bruto: "",
        impostos: "0",
        data_emissao: new Date().toISOString().slice(0, 10),
        data_vencimento: new Date().toISOString().slice(0, 10),
        data_pagamento: "",
        categoria: "outros",
        status: "pendente",
        forma_pagamento: "",
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const { error: err } = await supabase.schema("mining_finance").from("contas_pagar").insert({
            projeto_id: form.projeto_id || null,
            descricao: form.descricao,
            valor_bruto: Number(form.valor_bruto),
            impostos: Number(form.impostos),
            data_emissao: form.data_emissao,
            data_vencimento: form.data_vencimento,
            data_pagamento: form.data_pagamento || null,
            categoria: form.categoria,
            status: form.status,
            forma_pagamento: form.forma_pagamento || null,
        });

        setLoading(false);
        if (err) {
            setError(err.message);
            return;
        }
        router.push("/dashboard/contas-pagar");
        router.refresh();
    }

    return (
        <>
            <div className="mb-8">
                <Link href="/dashboard/contas-pagar" className="text-slate-400 hover:text-white text-sm">
                    ← Voltar
                </Link>
                <h1 className="text-2xl font-bold text-white mt-2">Novo lançamento: Conta a pagar</h1>
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
                        <label className="block text-sm font-medium text-slate-300 mb-1">Categoria *</label>
                        <select
                            required
                            value={form.categoria}
                            onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
                            className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white focus:border-mine-500 focus:ring-1 focus:ring-mine-500 transition-all outline-none"
                        >
                            {CATEGORIAS.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Descrição / Fornecedor *</label>
                    <input
                        type="text"
                        required
                        value={form.descricao}
                        onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                        placeholder="Ex: Factura de energia EdM Jan/2025"
                        className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white focus:border-mine-500 focus:ring-1 focus:ring-mine-500 transition-all outline-none"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Valor Bruto (MZN) *</label>
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
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Impostos (MZN)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={form.impostos}
                            onChange={(e) => setForm((f) => ({ ...f, impostos: e.target.value }))}
                            className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white focus:border-mine-500 focus:ring-1 focus:ring-mine-500 transition-all outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Data Emissão *</label>
                        <input
                            type="date"
                            required
                            value={form.data_emissao}
                            onChange={(e) => setForm((f) => ({ ...f, data_emissao: e.target.value }))}
                            className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white focus:border-mine-500 focus:ring-1 focus:ring-mine-500 transition-all outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Vencimento *</label>
                        <input
                            type="date"
                            required
                            value={form.data_vencimento}
                            onChange={(e) => setForm((f) => ({ ...f, data_vencimento: e.target.value }))}
                            className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white focus:border-mine-500 focus:ring-1 focus:ring-mine-500 transition-all outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Data Pagamento</label>
                        <input
                            type="date"
                            value={form.data_pagamento}
                            onChange={(e) => setForm((f) => ({ ...f, data_pagamento: e.target.value }))}
                            className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white focus:border-mine-500 focus:ring-1 focus:ring-mine-500 transition-all outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Forma de Pagamento</label>
                        <input
                            type="text"
                            value={form.forma_pagamento}
                            onChange={(e) => setForm((f) => ({ ...f, forma_pagamento: e.target.value }))}
                            placeholder="Ex: Transferência Bancária, M-Pesa"
                            className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white focus:border-mine-500 focus:ring-1 focus:ring-mine-500 transition-all outline-none"
                        />
                    </div>
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
                        href="/dashboard/contas-pagar"
                        className="px-8 py-2.5 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 transition-all"
                    >
                        Cancelar
                    </Link>
                </div>
            </form>
        </>
    );
}
