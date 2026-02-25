import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getActiveEmpresaId } from "@/lib/empresa-ativa";
import { Plus } from "lucide-react";

const CATEGORIA_LABEL: Record<string, string> = {
  combustivel: "Combustível",
  energia: "Energia",
  agua: "Água",
  manutencao: "Manutenção",
  aluguel: "Aluguel",
  salarios: "Salários",
  encargos: "Encargos",
  frete: "Frete",
  insumos: "Insumos",
  servicos_terceiros: "Serviços terceiros",
  depreciacao: "Depreciação",
  financiamento: "Financiamento",
  outros: "Outros",
};

export default async function ContasPagarPage() {
  const supabase = await createClient();
  const activeEmpresaId = await getActiveEmpresaId();
  let query = supabase
    .schema("mining_finance")
    .from("vw_contas_pagar_consolidado")
    .select("id, descricao, valor_bruto, data_vencimento, status, categoria, projeto_id, tipo_origem")
    .order("data_vencimento", { ascending: false })
    .limit(100);
  if (activeEmpresaId) {
    const { data: projetoIds } = await supabase.schema("mining_finance").from("projetos").select("id").eq("empresa_id", activeEmpresaId);
    const ids = (projetoIds || []).map((p: { id: string }) => p.id);
    if (ids.length > 0) query = query.in("projeto_id", ids);
    else query = query.is("projeto_id", null);
  }
  const { data: contas } = await query;

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Contas a pagar</h1>
        <Link
          href="/dashboard/contas-pagar/novo"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-mine-600 text-white font-medium hover:bg-mine-500 transition"
        >
          <Plus className="w-5 h-5" />
          Novo lançamento
        </Link>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-left text-slate-400">
              <th className="p-3">Vencimento</th>
              <th className="p-3">Descrição</th>
              <th className="p-3">Categoria</th>
              <th className="p-3 text-right">Valor</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {(contas || []).length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-slate-500 text-center">
                  Nenhuma conta a pagar registrada.
                </td>
              </tr>
            ) : (
              (contas || []).map((c: { id: string; descricao: string; valor_bruto: number; data_vencimento: string; status: string; categoria: string; tipo_origem: string }) => (
                <tr key={c.id} className={`border-b border-slate-700/50 ${c.tipo_origem === 'financiamento' ? 'bg-mine-900/10' : ''}`}>
                  <td className="p-3">{c.data_vencimento}</td>
                  <td className="p-3 text-white">{c.descricao}</td>
                  <td className="p-3 text-slate-300">{CATEGORIA_LABEL[c.categoria] ?? c.categoria}</td>
                  <td className="p-3 text-right">
                    {Number(c.valor_bruto).toLocaleString("pt-MZ", { style: "currency", currency: "MZN" })}
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-xs ${c.status === "pago" ? "bg-mine-900/50 text-mine-400" : "bg-amber-900/50 text-amber-400"
                        }`}
                    >
                      {c.status === "pago" ? "Pago" : "Pendente"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
