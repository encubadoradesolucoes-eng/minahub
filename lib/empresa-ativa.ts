import { cookies } from "next/headers";
import { getLicencaStatus } from "@/lib/saas";

export const COOKIE_EMPRESA_ATIVA = "minehub_empresa_id";

export type ReadonlyCookies = Awaited<ReturnType<typeof cookies>>;

/**
 * Retorna o ID da empresa ativa a partir do cookie, se for um dos IDs válidos do usuário.
 */
export function getActiveEmpresaIdFromCookie(
  cookieStore: ReadonlyCookies,
  validEmpresaIds: string[]
): string | null {
  const cookie = cookieStore.get(COOKIE_EMPRESA_ATIVA);
  const value = cookie?.value?.trim();
  if (!value || !validEmpresaIds.includes(value)) return null;
  return value;
}

/**
 * Resolve a empresa ativa: cookie (se válido) ou primeira empresa com licença.
 */
export function resolveActiveEmpresaId(
  cookieStore: ReadonlyCookies,
  empresasComLicenca: { id: string; licenca_ativa?: unknown }[]
): string | null {
  const validIds = empresasComLicenca.map((e) => e.id);
  const fromCookie = getActiveEmpresaIdFromCookie(cookieStore, validIds);
  if (fromCookie) return fromCookie;
  const firstWithLicense = empresasComLicenca.find((e) => e.licenca_ativa);
  return firstWithLicense?.id ?? null;
}

/**
 * Retorna o ID da empresa ativa para a requisição atual (para uso em server components).
 */
export async function getActiveEmpresaId(): Promise<string | null> {
  const licenca = await getLicencaStatus();
  const cookieStore = await cookies();
  return resolveActiveEmpresaId(cookieStore, licenca.empresas);
}
