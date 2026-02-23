import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-4">
      <h1 className="text-4xl font-bold text-mine-400">MineHub</h1>
      <p className="text-slate-400 text-center max-w-md">
        Gestão de mineração e finanças. Acesse para continuar.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-6 py-3 rounded-lg bg-mine-600 text-white font-medium hover:bg-mine-500 transition"
        >
          Entrar
        </Link>
        <Link
          href="/signup"
          className="px-6 py-3 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 transition"
        >
          Cadastrar
        </Link>
      </div>
    </div>
  );
}
