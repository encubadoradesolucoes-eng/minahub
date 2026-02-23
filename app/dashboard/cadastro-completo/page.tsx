"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { TipoTenant } from "@/types/database";

const TRIAL_DIAS = 30;

export default function CadastroCompletoPage() {
  const router = useRouter();
  const supabase = createClient();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    cnpj: "",
    tipo_tenant: "empresa" as TipoTenant,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Sessão expirada. Faça login novamente.");
      setLoading(false);
      return;
    }

    const { data: empresa, error: errEmpresa } = await supabase
      .schema("mining_finance")
      .from("empresas")
      .insert({
        nome: form.nome.trim(),
        cnpj: form.cnpj.trim() || null,
        tipo_tenant: form.tipo_tenant,
      })
      .select("id")
      .single();

    if (errEmpresa || !empresa) {
      setError(errEmpresa?.message ?? "Erro ao criar empresa.");
      setLoading(false);
      return;
    }

    const { error: errUserEmpresa } = await supabase
      .schema("mining_finance")
      .from("user_empresas")
      .insert({ user_id: user.id, empresa_id: empresa.id });

    if (errUserEmpresa) {
      setError(errUserEmpresa.message);
      setLoading(false);
      return;
    }

    const dataFim = new Date();
    dataFim.setDate(dataFim.getDate() + TRIAL_DIAS);
    const { error: errLicenca } = await supabase
      .schema("mining_finance")
      .from("licencas")
      .insert({
        empresa_id: empresa.id,
        plano: "trial",
        data_inicio: new Date().toISOString().slice(0, 10),
        data_fim: dataFim.toISOString().slice(0, 10),
        ativo: true,
      });

    if (errLicenca) {
      setError("Empresa criada, mas falha ao ativar licença trial: " + errLicenca.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Completar cadastro</h1>
      <p className="text-slate-400 mb-6">
        O MineHub funciona como SaaS: cada empresa ou explorador precisa estar cadastrado e usar o sistema mediante
        licença. Crie sua empresa (ou perfil de explorador) para começar. Você receberá uma <strong>licença trial de {TRIAL_DIAS} dias</strong>.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-700 bg-slate-800/50 p-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Tipo</label>
          <select
            value={form.tipo_tenant}
            onChange={(e) => setForm((f) => ({ ...f, tipo_tenant: e.target.value as TipoTenant }))}
            className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white"
          >
            <option value="empresa">Empresa</option>
            <option value="explorador">Explorador individual</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            {form.tipo_tenant === "explorador" ? "Nome (explorador)" : "Nome da empresa"} *
          </label>
          <input
            type="text"
            required
            value={form.nome}
            onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
            className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white"
            placeholder={form.tipo_tenant === "explorador" ? "Seu nome ou razão" : "Razão social"}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">CNPJ (opcional)</label>
          <input
            type="text"
            value={form.cnpj}
            onChange={(e) => setForm((f) => ({ ...f, cnpj: e.target.value }))}
            className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white"
            placeholder="00.000.000/0001-00"
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-mine-600 text-white font-medium hover:bg-mine-500 disabled:opacity-50"
        >
          {loading ? "Cadastrando…" : "Criar e ativar licença trial"}
        </button>
      </form>

      <p className="mt-4 text-slate-500 text-sm text-center">
        Já tem uma empresa? Peça ao administrador para vincular seu usuário à empresa.
      </p>
    </div>
  );
}
