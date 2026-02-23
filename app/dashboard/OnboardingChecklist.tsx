"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, ChevronDown, ChevronUp, X } from "lucide-react";

const STORAGE_KEY = "minehub_onboarding_dismissed";

type Props = {
  activeEmpresaId: string | null;
  countProjetos: number;
  countEquipamentos: number;
  countExtracao: number;
};

export default function OnboardingChecklist({ activeEmpresaId, countProjetos, countEquipamentos, countExtracao }: Props) {
  const [dismissed, setDismissed] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(STORAGE_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  const done = countProjetos > 0 && countEquipamentos > 0 && countExtracao > 0;
  const anyDone = countProjetos > 0 || countEquipamentos > 0 || countExtracao > 0;
  const show = activeEmpresaId && !done && !dismissed;

  function handleDismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setDismissed(true);
  }

  if (!show) return null;

  const items = [
    { done: countProjetos > 0, label: "Criar seu primeiro projeto", href: "/dashboard/projetos/novo" },
    { done: countEquipamentos > 0, label: "Cadastrar um equipamento", href: "/dashboard/equipamentos/novo" },
    { done: countExtracao > 0, label: "Registrar uma extração", href: "/dashboard/extracao/novo" },
  ];

  return (
    <section className="mb-6 rounded-xl border border-mine-800 bg-mine-950/30 p-4">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 text-left text-mine-300 font-medium hover:text-mine-200"
        >
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          Primeiros passos
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="p-1 text-slate-500 hover:text-slate-400"
          aria-label="Ocultar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {open && (
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-2 text-sm text-slate-300 hover:text-white"
              >
                {item.done ? (
                  <CheckCircle2 className="w-4 h-4 text-mine-500 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                )}
                <span className={item.done ? "line-through text-slate-500" : ""}>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
