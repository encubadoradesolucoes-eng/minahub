import { createClient } from "@/lib/supabase/server";
import { getActiveEmpresaId } from "@/lib/empresa-ativa";
import NovaExtracaoForm from "./NovaExtracaoForm";
import type { Projeto } from "@/types/database";

export default async function NovaExtracaoPage() {
  const supabase = await createClient();
  const activeEmpresaId = await getActiveEmpresaId();
  let projetos: Projeto[] = [];
  if (activeEmpresaId) {
    const { data } = await supabase
      .schema("mining_finance")
      .from("projetos")
      .select("id, nome, codigo")
      .eq("empresa_id", activeEmpresaId)
      .order("nome");
    projetos = (data as Projeto[]) || [];
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-2xl">
      <NovaExtracaoForm projetos={projetos} />
    </div>
  );
}
