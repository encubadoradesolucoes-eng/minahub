import { getActiveEmpresaId } from "@/lib/empresa-ativa";
import NovoProjetoForm from "./NovoProjetoForm";

export default async function NovoProjetoPage() {
  const activeEmpresaId = await getActiveEmpresaId();

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <NovoProjetoForm activeEmpresaId={activeEmpresaId} />
    </div>
  );
}
