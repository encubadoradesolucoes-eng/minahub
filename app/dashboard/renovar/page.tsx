import Link from "next/link";
import { Check, Zap } from "lucide-react";

const PLANOS = [
  {
    id: "basico",
    nome: "Básico",
    desc: "1 empresa, até 3 usuários, projetos e extração ilimitados.",
    preco: "Sob consulta",
    destaque: false,
  },
  {
    id: "profissional",
    nome: "Profissional",
    desc: "Múltiplas empresas, usuários ilimitados, planejamento de missão e relatórios.",
    preco: "Sob consulta",
    destaque: true,
  },
  {
    id: "empresarial",
    nome: "Empresarial",
    desc: "Tudo do Profissional + suporte prioritário e integrações sob medida.",
    preco: "Sob consulta",
    destaque: false,
  },
];

export default function RenovarPage() {
  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Planos e renovação</h1>
      <p className="text-slate-400 mb-8">
        Escolha o plano ideal para sua operação. Entre em contato para contratar ou renovar sua licença.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {PLANOS.map((plano) => (
          <div
            key={plano.id}
            className={`rounded-xl border p-6 ${
              plano.destaque
                ? "border-mine-500 bg-mine-950/40"
                : "border-slate-700 bg-slate-800/50"
            }`}
          >
            {plano.destaque && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-mine-400 mb-2">
                <Zap className="w-3 h-3" /> Recomendado
              </span>
            )}
            <h2 className="text-lg font-semibold text-white mb-1">{plano.nome}</h2>
            <p className="text-slate-400 text-sm mb-4">{plano.desc}</p>
            <p className="text-mine-400 font-semibold">{plano.preco}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
        <h2 className="text-lg font-semibold text-white mb-3">Solicitar renovação ou novo plano</h2>
        <p className="text-slate-400 text-sm mb-4">
          Envie um e-mail com o nome da sua empresa e o plano desejado. Nossa equipe retorna em até 24h úteis.
        </p>
        <a
          href="mailto:contato@minehub.com.br?subject=Renovação ou novo plano - MineHub"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-mine-600 text-white font-medium hover:bg-mine-500 transition"
        >
          <Check className="w-4 h-4" />
          contato@minehub.com.br
        </a>
      </div>

      <p className="mt-6 text-slate-500 text-sm">
        <Link href="/dashboard/conta" className="text-mine-400 hover:underline">
          ← Voltar para Minha conta
        </Link>
      </p>
    </div>
  );
}
