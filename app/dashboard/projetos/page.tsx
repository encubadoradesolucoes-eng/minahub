import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { getActiveEmpresaId } from "@/lib/empresa-ativa";
import type { Projeto } from "@/types/database";
import { Plus } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  planejamento: "Planejamento",
  ativo: "Ativo",
  pausado: "Pausado",
  concluido: "Concluído",
};

const TIPO_LABEL: Record<string, string> = {
  exploracao: "Exploração",
  desenvolvimento: "Desenvolvimento",
  producao: "Produção",
  reabilitacao: "Reabilitação",
};

export default async function ProjetosPage() {
  const supabase = await createClient();
  const activeEmpresaId = await getActiveEmpresaId();
  let query = supabase.schema("mining_finance").from("projetos").select("*").order("nome");
  if (activeEmpresaId) {
    query = query.eq("empresa_id", activeEmpresaId);
  }
  const { data: projetos, error } = await query;

  if (error) {
    return (
      <div className="p-6 md:p-8">
        <p className="text-red-400">Erro ao carregar projetos: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Projetos</h1>
        <Link
          href="/dashboard/projetos/novo"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-mine-600 text-white font-medium hover:bg-mine-500 transition"
        >
          <Plus className="w-5 h-5" />
          Novo projeto
        </Link>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800/50 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="border-b border-slate-700 text-left text-slate-400">
              <th className="p-3">Código</th>
              <th className="p-3">Nome</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Status</th>
              <th className="p-3">Mineral</th>
              <th className="p-3 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {(projetos || []).length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-slate-500 text-center">
                  Nenhum projeto cadastrado. Crie o primeiro em &quot;Novo projeto&quot;.
                </td>
              </tr>
            ) : (
              (projetos as Projeto[]).map((p) => (
                <tr key={p.id} className="border-b border-slate-700/50 hover:bg-slate-800">
                  <td className="p-3 font-mono text-slate-300">{p.codigo}</td>
                  <td className="p-3 text-white">{p.nome}</td>
                  <td className="p-3 text-slate-300">{p.tipo_projeto ? TIPO_LABEL[p.tipo_projeto] ?? p.tipo_projeto : "—"}</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-xs ${
                        p.status === "ativo"
                          ? "bg-mine-900/50 text-mine-400"
                          : p.status === "concluido"
                          ? "bg-slate-700 text-slate-400"
                          : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {p.status ? STATUS_LABEL[p.status] ?? p.status : "—"}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">{p.mineral_principal ?? "—"}</td>
                  <td className="p-3">
                    <Link
                      href={`/dashboard/projetos/${p.id}`}
                      className="text-mine-400 hover:underline text-sm"
                    >
                      Editar
                    </Link>
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
