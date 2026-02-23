import { createClient } from "@/lib/supabase/server";
import { getLicencaStatus } from "@/lib/saas";
import Link from "next/link";

const PLANO_LABEL: Record<string, string> = {
  trial: "Trial",
  basico: "Básico",
  profissional: "Profissional",
  empresarial: "Empresarial",
  custom: "Customizado",
};

export default async function ContaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const licenca = await getLicencaStatus();

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-8">Minha conta</h1>

      <section className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Usuário</h2>
        <p className="text-slate-300">{user?.email}</p>
      </section>

      <section className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Empresas vinculadas</h2>
        {licenca.empresas.length === 0 ? (
          <p className="text-slate-500">Nenhuma empresa vinculada.</p>
        ) : (
          <ul className="space-y-3">
            {licenca.empresas.map((e) => (
              <li key={e.id} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                <div>
                  <p className="text-white font-medium">{e.nome}</p>
                  <p className="text-slate-500 text-sm">
                    {e.tipo_tenant === "explorador" ? "Explorador" : "Empresa"}
                    {e.cnpj && ` · ${e.cnpj}`}
                  </p>
                </div>
                {e.licenca_ativa ? (
                  <span className="text-mine-400 text-sm">
                    {PLANO_LABEL[e.licenca_ativa.plano] ?? e.licenca_ativa.plano} até {e.licenca_ativa.data_fim}
                  </span>
                ) : (
                  <span className="text-amber-400 text-sm">Sem licença ativa</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Licença em uso</h2>
        {licenca.licencaAtiva && licenca.empresaAtiva ? (
          <div>
            <p className="text-slate-300">
              <strong className="text-white">{licenca.empresaAtiva.nome}</strong>
            </p>
            <p className="text-mine-400 mt-1">
              Plano {PLANO_LABEL[licenca.licencaAtiva.plano] ?? licenca.licencaAtiva.plano} · válido até{" "}
              {licenca.licencaAtiva.data_fim}
            </p>
            {licenca.licencaAtiva.max_usuarios != null && (
              <p className="text-slate-500 text-sm mt-2">Máx. usuários: {licenca.licencaAtiva.max_usuarios}</p>
            )}
            {licenca.licencaAtiva.max_projetos != null && (
              <p className="text-slate-500 text-sm">Máx. projetos: {licenca.licencaAtiva.max_projetos}</p>
            )}
          </div>
        ) : (
          <p className="text-slate-500 mb-3">Nenhuma licença ativa.</p>
          <Link href="/dashboard/renovar" className="text-mine-400 hover:underline text-sm">
            Ver planos e renovar →
          </Link>
        )}
      </section>
    </div>
  );
}
