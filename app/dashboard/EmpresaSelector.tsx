"use client";

import { useRouter } from "next/navigation";
import { setEmpresaAtiva } from "./actions";
import type { Empresa } from "@/types/database";
import { Building2 } from "lucide-react";

type EmpresaComLicenca = Empresa & { licenca_ativa?: unknown };

export function EmpresaSelector({
  empresas,
  activeEmpresaId,
}: {
  empresas: EmpresaComLicenca[];
  activeEmpresaId: string | null;
}) {
  const router = useRouter();
  const comLicenca = empresas.filter((e) => e.licenca_ativa);

  if (comLicenca.length <= 1) {
    return (
      <div className="px-3 py-2 text-xs text-slate-500 border-b border-slate-800 truncate" title={activeEmpresaId ? comLicenca[0]?.nome : ""}>
        <Building2 className="w-4 h-4 inline-block mr-1.5 align-middle text-slate-600" />
        {comLicenca[0]?.nome ?? "—"}
      </div>
    );
  }

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    if (!id) return;
    await setEmpresaAtiva(id);
    router.refresh();
  }

  return (
    <div className="px-3 py-2 border-b border-slate-800">
      <label className="block text-xs text-slate-500 mb-1">Empresa ativa</label>
      <select
        value={activeEmpresaId ?? ""}
        onChange={handleChange}
        className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-600 text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-mine-500"
      >
        {comLicenca.map((emp) => (
          <option key={emp.id} value={emp.id}>
            {emp.nome}
          </option>
        ))}
      </select>
    </div>
  );
}
