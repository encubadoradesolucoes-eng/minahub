import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getActiveEmpresaId } from "@/lib/empresa-ativa";
import { Plus } from "lucide-react";
import type { Extracao } from "@/types/database";

const TURNO: Record<string, string> = { manha: "Manhã", tarde: "Tarde", noite: "Noite" };

export default async function ExtracaoPage() {
  const supabase = await createClient();
  const activeEmpresaId = await getActiveEmpresaId();
  let query = supabase
    .schema("mining_finance")
    .from("extracao")
    .select("*, projetos(nome, empresa_id)")
    .order("data_extracao", { ascending: false })
    .limit(50);
  let extracao: unknown[] | null = null;
  if (activeEmpresaId) {
    const { data: projetoIds } = await supabase.schema("mining_finance").from("projetos").select("id").eq("empresa_id", activeEmpresaId);
    const ids = (projetoIds || []).map((p: { id: string }) => p.id);
    if (ids.length > 0) {
      const res = await query.in("projeto_id", ids);
      extracao = res.data;
    } else {
      extracao = [];
    }
  } else {
    const res = await query;
    extracao = res.data;
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Extração</h1>
        <Link
          href="/dashboard/extracao/novo"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-mine-600 text-white font-medium hover:bg-mine-500 transition"
        >
          <Plus className="w-5 h-5" />
          Nova extração
        </Link>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-left text-slate-400">
              <th className="p-3">Data</th>
              <th className="p-3">Projeto</th>
              <th className="p-3">Turno</th>
              <th className="p-3 text-right">Ton. brutas</th>
              <th className="p-3 text-right">Teor %</th>
              <th className="p-3 text-right">Custo op.</th>
            </tr>
          </thead>
          <tbody>
            {(extracao || []).length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-slate-500 text-center">
                  Nenhuma extração.{" "}
                  <Link href="/dashboard/extracao/novo" className="text-mine-400 hover:underline">
                    Registrar primeira extração
                  </Link>
                </td>
              </tr>
            ) : (
              (extracao || []).map((e: Extracao & { projetos: { nome: string } | null }) => (
                <tr key={e.id} className="border-b border-slate-700/50">
                  <td className="p-3">{e.data_extracao}</td>
                  <td className="p-3">{(e.projetos as { nome: string } | null)?.nome ?? "—"}</td>
                  <td className="p-3">{e.turno ? TURNO[e.turno] ?? e.turno : "—"}</td>
                  <td className="p-3 text-right">{Number(e.toneladas_brutas).toLocaleString("pt-BR")}</td>
                  <td className="p-3 text-right">{e.teor_medio != null ? `${Number(e.teor_medio).toFixed(2)}%` : "—"}</td>
                  <td className="p-3 text-right">
                    {e.custo_operacional != null
                      ? Number(e.custo_operacional).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                      : "—"}
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
