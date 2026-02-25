import { createClient } from "@/lib/supabase/server";

export interface MaintenanceAlert {
    id: string;
    equipamento_nome: string;
    codigo: string;
    tipo: string;
    dias_restantes: number;
}

export async function getMaintenanceAlerts(): Promise<MaintenanceAlert[]> {
    const supabase = await createClient();

    // No modo simulação, retornaremos alguns alertas mockados
    // No modo real, isso buscaria de uma tabela de agendamento de manutenção

    return [
        {
            id: "m1",
            equipamento_nome: "Escavadeira Caterpillar 320",
            codigo: "ESC-001",
            tipo: "Troca de Óleo",
            dias_restantes: 3
        },
        {
            id: "m2",
            equipamento_nome: "Caminhão Scania G450",
            codigo: "CAM-012",
            tipo: "Revisão de Freios",
            dias_restantes: -2 // Atrasado
        }
    ];
}
