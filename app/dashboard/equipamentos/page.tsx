import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { Equipamento } from "@/types/database";

const TIPO_LABEL: Record<string, string> = {
  caminhao: "Caminhão",
  escavadeira: "Escavadeira",
  perfuratriz: "Perfuratriz",
  britador: "Britador",
  gerador: "Gerador",
  outros: "Outros",
};
const STATUS_LABEL: Record<string, string> = {
  operacional: "Operacional",
  manutencao: "Manutenção",
  inativo: "Inativo",
};

export default async function EquipamentosPage() {
  const supabase = await createClient();
  const { data: equipamentos } = await supabase
    .schema("mining_finance")
    .from("equipamentos")
    .select("*")
    .order("codigo");

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Equipamentos</h1>
        <Link
          href="/dashboard/equipamentos/novo"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-mine-600 text-white font-medium hover:bg-mine-500 transition"
        >
          <Plus className="w-5 h-5" />
          Novo equipamento
        </Link>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-left text-slate-400">
              <th className="p-3">Código</th>
              <th className="p-3">Nome</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Valor aquisição</th>
            </tr>
          </thead>
          <tbody>
            {(equipamentos || []).length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-slate-500 text-center">
                  Nenhum equipamento.{" "}
                  <Link href="/dashboard/equipamentos/novo" className="text-mine-400 hover:underline">
                    Cadastrar
                  </Link>
                </td>
              </tr>
            ) : (
              (equipamentos as Equipamento[]).map((eq) => (
                <tr key={eq.id} className="border-b border-slate-700/50">
                  <td className="p-3 font-mono text-slate-300">{eq.codigo}</td>
                  <td className="p-3 text-white">{eq.nome}</td>
                  <td className="p-3 text-slate-300">{eq.tipo ? TIPO_LABEL[eq.tipo] ?? eq.tipo : "—"}</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-xs ${
                        eq.status === "operacional"
                          ? "bg-mine-900/50 text-mine-400"
                          : eq.status === "manutencao"
                          ? "bg-amber-900/50 text-amber-400"
                          : "bg-slate-700 text-slate-400"
                      }`}
                    >
                      {eq.status ? STATUS_LABEL[eq.status] ?? eq.status : "—"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {eq.valor_aquisicao != null
                      ? Number(eq.valor_aquisicao).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
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
