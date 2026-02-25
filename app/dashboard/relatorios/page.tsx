import { getActiveEmpresaId } from "@/lib/empresa-ativa";
import { createClient } from "@/lib/supabase/server";
import { FileText, Download, Printer } from "lucide-react";

export default async function RelatoriosPage() {
    const activeEmpresaId = await getActiveEmpresaId();
    const supabase = await createClient();

    const relatorios = [
        { name: "Resumo de Produção Diário", description: "Consolida toneladas brutas e custo por turno.", category: "Produção" },
        { name: "Fluxo de Caixa Mensal", description: "Projeção de entradas e saídas para os próximos 30 dias.", category: "Financeiro" },
        { name: "Inventário de Equipamentos", description: "Status de manutenção e valor de ativos.", category: "Ativos" },
        { name: "Relatório de Projetos ROI", description: "Rentabilidade detalhada por frente de lavra.", category: "Estratégico" }
    ];

    return (
        <div className="p-6 md:p-8 max-w-5xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Centro de Relatórios</h1>
                <p className="text-slate-400 text-sm">Gere documentos oficiais e exportações do sistema.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatorios.map((rel) => (
                    <div key={rel.name} className="p-6 rounded-xl bg-slate-900 border border-slate-800 hover:border-mine-500/50 transition flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase tracking-wider">
                                    {rel.category}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">{rel.name}</h3>
                            <p className="text-sm text-slate-400 mb-6">{rel.description}</p>
                        </div>

                        <div className="flex gap-3">
                            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition">
                                <Printer className="w-4 h-4" />
                                Imprimir
                            </button>
                            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-mine-600/10 text-mine-400 border border-mine-600/20 text-sm font-medium hover:bg-mine-600/20 transition">
                                <Download className="w-4 h-4" />
                                Excel
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 p-8 rounded-xl border border-dashed border-slate-700 text-center">
                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h4 className="text-white font-semibold">Deseja um relatório personalizado?</h4>
                <p className="text-slate-400 text-sm mt-2 max-w-sm mx-auto">
                    Podemos configurar filtros específicos para auditorias ou apresentações a investidores.
                </p>
                <button className="mt-6 px-6 py-2 rounded-lg bg-slate-100 text-slate-900 text-sm font-bold hover:bg-white transition">
                    Solicitar Suporte
                </button>
            </div>
        </div>
    );
}
