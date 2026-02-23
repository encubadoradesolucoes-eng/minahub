"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_EMPRESA_ATIVA } from "@/lib/empresa-ativa";

export async function setEmpresaAtiva(empresaId: string) {
  const store = await cookies();
  store.set(COOKIE_EMPRESA_ATIVA, empresaId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  redirect("/dashboard");
}
