import { createClient } from "@/lib/supabase/server";

export interface DashboardStats {
    totalPagar: number;
    totalReceber: number;
    saldoProjetado: number;
    custoMedioPorTonelada: number;
    roiMedio: number;
}

export async function getFinancialSummary(activeEmpresaId: string | null): Promise<DashboardStats> {
    const supabase = await createClient();

    // No modo simulação o supabase.schema() já retorna o mock builder que criamos.

    // 1. Buscar Contas a Pagar (Pendentes)
    let pagarQuery = supabase.schema("mining_finance").from("contas_pagar").select("valor_bruto").eq("status", "pendente");

    // 2. Buscar Contas a Receber (Pendentes)
    let receberQuery = supabase.schema("mining_finance").from("contas_receber").select("valor_bruto").eq("status", "pendente");

    // 3. Buscar Extração para custo médio
    let extracaoQuery = supabase.schema("mining_finance").from("extracao").select("toneladas_brutas, custo_operacional");

    if (activeEmpresaId) {
        const { data: projetoIds } = await supabase.schema("mining_finance").from("projetos").select("id").eq("empresa_id", activeEmpresaId);
        const ids = (projetoIds || []).map((p: any) => p.id);

        if (ids.length > 0) {
            pagarQuery = pagarQuery.in("projeto_id", ids);
            receberQuery = receberQuery.in("projeto_id", ids);
            extracaoQuery = extracaoQuery.in("projeto_id", ids);
        }
    }

    const [resPagar, resReceber, resExtracao] = await Promise.all([
        pagarQuery,
        receberQuery,
        extracaoQuery
    ]);

    const totalPagar = (resPagar.data || []).reduce((acc: number, curr: any) => acc + Number(curr.valor_bruto), 0);
    const totalReceber = (resReceber.data || []).reduce((acc: number, curr: any) => acc + Number(curr.valor_bruto), 0);

    const totalToneladas = (resExtracao.data || []).reduce((acc: number, curr: any) => acc + Number(curr.toneladas_brutas), 0);
    const totalCustoExtracao = (resExtracao.data || []).reduce((acc: number, curr: any) => acc + Number(curr.custo_operacional), 0);

    const custoMedioPorTonelada = totalToneladas > 0 ? totalCustoExtracao / totalToneladas : 0;

    // ROI Simples: (Receita - Custo) / Custo
    // Para fins de demonstração inicial, usaremos os totais.
    const roiMedio = totalPagar > 0 ? (totalReceber - totalPagar) / totalPagar : 0;

    return {
        totalPagar,
        totalReceber,
        saldoProjetado: totalReceber - totalPagar,
        custoMedioPorTonelada,
        roiMedio
    };
}
