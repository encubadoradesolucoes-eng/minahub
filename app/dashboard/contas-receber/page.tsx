import { createClient } from "@/lib/supabase/server";
import { getActiveEmpresaId } from "@/lib/empresa-ativa";

export default async function ContasReceberPage() {
  const supabase = await createClient();
  const activeEmpresaId = await getActiveEmpresaId();
  let query = supabase
    .schema("mining_finance")
    .from("contas_receber")
    .select("id, nota_fiscal, quantidade_toneladas, valor_bruto, data_vencimento, status, projeto_id")
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
      <h1 className="text-2xl font-bold text-white mb-8">Contas a receber</h1>

      <div className="rounded-xl border border-slate-700 bg-slate-800/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-left text-slate-400">
              <th className="p-3">Vencimento</th>
              <th className="p-3">NF</th>
              <th className="p-3 text-right">Toneladas</th>
              <th className="p-3 text-right">Valor bruto</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {(contas || []).length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-slate-500 text-center">
                  Nenhuma conta a receber registrada.
                </td>
              </tr>
            ) : (
              (contas || []).map((c: { id: string; nota_fiscal: string | null; quantidade_toneladas: number; valor_bruto: number; data_vencimento: string; status: string }) => (
                <tr key={c.id} className="border-b border-slate-700/50">
                  <td className="p-3">{c.data_vencimento}</td>
                  <td className="p-3 font-mono text-slate-300">{c.nota_fiscal ?? "—"}</td>
                  <td className="p-3 text-right">{Number(c.quantidade_toneladas).toLocaleString("pt-BR")}</td>
                  <td className="p-3 text-right">
                    {Number(c.valor_bruto).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-xs ${
                        c.status === "recebida" ? "bg-mine-900/50 text-mine-400" : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {c.status}
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
