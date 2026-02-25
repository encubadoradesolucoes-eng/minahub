import { User } from "@supabase/supabase-js";

export type UserRole = "admin" | "gerente" | "operador";

export function getRole(user: User | null): UserRole {
    if (!user) return "operador";
    return (user.user_metadata?.role as UserRole) || "operador";
}

export function canAccess(role: UserRole, target: string): boolean {
    if (role === "admin") return true;

    const permissions: Record<UserRole, string[]> = {
        admin: ["financeiro", "projetos", "extracao", "equipamentos", "relatorios"],
        gerente: ["projetos", "extracao", "equipamentos", "relatorios"],
        operador: ["extracao", "equipamentos"]
    };

    return permissions[role].includes(target);
}
