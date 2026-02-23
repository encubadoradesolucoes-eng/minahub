import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import ProjetoForm from "./ProjetoForm";
import type { Projeto } from "@/types/database";

export default async function EditarProjetoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: projeto, error } = await supabase
    .schema("mining_finance")
    .from("projetos")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !projeto) {
    notFound();
  }

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/dashboard/projetos" className="text-slate-400 hover:text-white text-sm">
          ← Voltar
        </Link>
        <h1 className="text-2xl font-bold text-white mt-2">Editar projeto</h1>
      </div>
      <ProjetoForm projeto={projeto as Projeto} />
    </div>
  );
}
