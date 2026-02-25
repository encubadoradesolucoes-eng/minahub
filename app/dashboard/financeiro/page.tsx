import { getFinancialSummary } from "@/lib/financeiro";
import { getActiveEmpresaId } from "@/lib/empresa-ativa";
import { Wallet, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Link from "next/link";

export default async function FinanceiroPage() {
    const activeEmpresaId = await getActiveEmpresaId();
    const res = await getFinancialSummary(activeEmpresaId);

    const cards = [
        {
            title: "Saldo Projetado",
            value: res.saldoProjetado,
            icon: Wallet,
            color: res.saldoProjetado >= 0 ? "text-mine-400" : "text-red-400",
            description: "Recebíveis - Pendentes"
        },
        {
            title: "Contas a Receber",
            value: res.totalReceber,
            icon: ArrowUpRight,
            color: "text-blue-400",
            description: "Total pendente"
        },
        {
            title: "Contas a Pagar",
            value: res.totalPagar,
            icon: ArrowDownRight,
            color: "text-amber-400",
            description: "Total vencendo"
        },
        {
            title: "Custo Médio/Ton",
            value: res.custoMedioPorTonelada,
            icon: TrendingUp,
            suffix: "/ton",
            color: "text-purple-400",
            description: "Baseado em extração"
        }
    ];

    return (
        <div className="p-6 md:p-8 max-w-6xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white">Módulo Financeiro</h1>
                    <p className="text-slate-400 text-sm">Gestão avançada de caixa e ROI</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/dashboard/contas-pagar" className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 text-sm hover:bg-slate-700 transition">
                        Pagar
                    </Link>
                    <Link href="/dashboard/contas-receber" className="px-4 py-2 rounded-lg bg-slate-800 text-slate-200 text-sm hover:bg-slate-700 transition">
                        Receber
                    </Link>
                </div>
            </div>

            {/* Grid de Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {cards.map((card) => (
                    <div key={card.title} className="p-6 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <card.icon className={`w-5 h-5 ${card.color}`} />
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Geral</span>
                        </div>
                        <div className="mt-2">
                            <h3 className="text-2xl font-bold text-white">
                                {card.value.toLocaleString('pt-MZ', { style: 'currency', currency: 'MZN' })}{card.suffix || ''}
                            </h3>
                            <p className="text-sm text-slate-300 font-medium">{card.title}</p>
                            <p className="text-xs text-slate-500 mt-1">{card.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Seção ROI */}
                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-mine-400" />
                        Análise de ROI por Projeto
                    </h2>
                    <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-slate-300 text-sm">ROI Médio Estimado</span>
                                <span className={`text-lg font-bold ${res.roiMedio >= 0 ? 'text-mine-400' : 'text-red-400'}`}>
                                    {(res.roiMedio * 100).toFixed(2)}%
                                </span>
                            </div>
                            <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${res.roiMedio >= 0 ? 'bg-mine-500' : 'bg-red-500'}`}
                                    style={{ width: `${Math.min(Math.abs(res.roiMedio * 100), 100)}%` }}
                                />
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 italic">
                            * O ROI é calculado comparando os recebíveis pendentes com as contas a pagar. No modo simulação, os valores são baseados em dados mock.
                        </p>
                    </div>
                </div>

                {/* Próximos Vencimentos */}
                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800">
                    <h2 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <button className="p-4 rounded-lg bg-slate-800 border border-slate-700 text-left hover:border-mine-500 transition">
                            <span className="block font-bold text-white text-sm">Fluxo Diário</span>
                            <span className="text-[10px] text-slate-400 uppercase">Visualizar</span>
                        </button>
                        <button className="p-4 rounded-lg bg-slate-800 border border-slate-700 text-left hover:border-mine-500 transition">
                            <span className="block font-bold text-white text-sm">Conciliação</span>
                            <span className="text-[10px] text-slate-400 uppercase">Em breve</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
