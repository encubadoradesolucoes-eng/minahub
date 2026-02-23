import { createClient } from "@/lib/supabase/server";
import type { Empresa, Licenca } from "@/types/database";

export interface LicencaStatus {
  hasEmpresa: boolean;
  hasLicencaAtiva: boolean;
  empresas: (Empresa & { licenca_ativa?: Licenca | null })[];
  licencaAtiva: Licenca | null;
  empresaAtiva: Empresa | null;
}

export async function getLicencaStatus(): Promise<LicencaStatus> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { hasEmpresa: false, hasLicencaAtiva: false, empresas: [], licencaAtiva: null, empresaAtiva: null };
  }

  const { data: userEmpresas } = await supabase
    .schema("mining_finance")
    .from("user_empresas")
    .select("empresa_id")
    .eq("user_id", user.id);

  const empresaIds = (userEmpresas || []).map((r: { empresa_id: string }) => r.empresa_id);
  if (empresaIds.length === 0) {
    return { hasEmpresa: false, hasLicencaAtiva: false, empresas: [], licencaAtiva: null, empresaAtiva: null };
  }

  const { data: empresas } = await supabase
    .schema("mining_finance")
    .from("empresas")
    .select("*")
    .in("id", empresaIds);

  const hoje = new Date().toISOString().slice(0, 10);
  const { data: licencas } = await supabase
    .schema("mining_finance")
    .from("licencas")
    .select("*")
    .in("empresa_id", empresaIds)
    .eq("ativo", true)
    .gte("data_fim", hoje);

  const licencaAtiva = (licencas && licencas.length > 0 ? licencas[0] : null) as Licenca | null;
  const empresaAtiva = licencaAtiva
    ? (empresas || []).find((e: Empresa) => e.id === licencaAtiva.empresa_id) as Empresa | null
    : null;

  const empresasComLicenca = (empresas || []).map((e: Empresa) => {
    const lic = (licencas || []).find((l: Licenca) => l.empresa_id === e.id) as Licenca | undefined;
    return { ...e, licenca_ativa: lic ?? null };
  });

  return {
    hasEmpresa: (empresas || []).length > 0,
    hasLicencaAtiva: !!licencaAtiva,
    empresas: empresasComLicenca,
    licencaAtiva,
    empresaAtiva: empresaAtiva ?? null,
  };
}
