import { createClient } from "@/lib/supabase/server";
import { getActiveEmpresaId } from "@/lib/empresa-ativa";
import ContasReceberForm from "./ContasReceberForm";

export default async function NovoContasReceberPage() {
    const supabase = await createClient();
    const activeEmpresaId = await getActiveEmpresaId();

    // Buscar projetos para o select
    let projetosSelect = supabase
        .schema("mining_finance")
        .from("projetos")
        .select("id, nome, codigo");

    if (activeEmpresaId) {
        projetosSelect = projetosSelect.eq("empresa_id", activeEmpresaId);
    }

    const { data: projetos } = await projetosSelect;

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto">
            <ContasReceberForm projetos={projetos || []} />
        </div>
    );
}
