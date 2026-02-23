import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function SemLicencaPage() {
  return (
    <div className="max-w-md mx-auto text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-900/50 text-amber-400 mb-6">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Licença inativa ou expirada</h1>
      <p className="text-slate-400 mb-6">
        O uso do MineHub é feito mediante licença. Sua licença trial expirou ou está inativa. Entre em contato com o
        suporte ou renove sua licença para continuar usando o sistema.
      </p>
      <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 text-left">
        <p className="text-slate-300 text-sm mb-2">O que fazer:</p>
        <ul className="text-slate-400 text-sm space-y-1 list-disc list-inside">
          <li>Entre em contato para contratar ou renovar uma licença (plano básico, profissional ou empresarial).</li>
          <li>Se você é administrador da empresa, verifique a validade em &quot;Minha conta&quot; após renovar.</li>
        </ul>
      </div>
      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/dashboard/renovar"
          className="inline-flex justify-center px-4 py-2 rounded-lg bg-mine-600 text-white font-medium hover:bg-mine-500"
        >
          Ver planos e renovar
        </Link>
        <Link href="/" className="inline-flex justify-center px-4 py-2 rounded-lg border border-slate-600 text-slate-400 hover:bg-slate-800">
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
