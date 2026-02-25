export type ProjetoStatus = "planejamento" | "ativo" | "pausado" | "concluido";
export type TipoProjeto = "exploracao" | "desenvolvimento" | "producao" | "reabilitacao";

export interface Projeto {
  id: string;
  nome: string;
  codigo: string;
  tipo_projeto: TipoProjeto | null;
  status: ProjetoStatus | null;
  mineral_principal: string | null;
  localizacao: { estado?: string; municipio?: string; coordenadas?: unknown } | null;
  data_inicio: string | null;
  data_previsao_termino: string | null;
  area_hectares: number | null;
  responsavel_tecnico_id: string | null;
  empresa_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjetoInsert {
  nome: string;
  codigo: string;
  tipo_projeto?: TipoProjeto | null;
  status?: ProjetoStatus | null;
  mineral_principal?: string | null;
  localizacao?: Record<string, unknown> | null;
  data_inicio?: string | null;
  data_previsao_termino?: string | null;
  area_hectares?: number | null;
  responsavel_tecnico_id?: string | null;
  empresa_id?: string | null;
}

export type Turno = "manha" | "tarde" | "noite";
export interface Extracao {
  id: string;
  projeto_id: string;
  data_extracao: string;
  turno: Turno | null;
  frente_trabalho: string | null;
  equipamento_id: string | null;
  toneladas_brutas: number;
  teor_medio: number | null;
  custo_operacional: number | null;
  custo_combustivel: number | null;
  custo_manutencao: number | null;
  observacoes: string | null;
  created_by: string | null;
  created_at: string;
}

export type EquipamentoTipo = "camiao" | "escavadeira" | "perfuratriz" | "britador" | "gerador" | "outros";
export type EquipamentoStatus = "operacional" | "manutencao" | "inativo";

export interface Equipamento {
  id: string;
  codigo: string;
  nome: string;
  tipo: EquipamentoTipo | null;
  marca: string | null;
  modelo: string | null;
  ano_fabricacao: number | null;
  valor_aquisicao: number | null;
  data_aquisicao: string | null;
  vida_util_anos: number | null;
  valor_residual: number | null;
  horas_trabalhadas_total: number;
  consumo_medio_combustivel: number | null;
  status: EquipamentoStatus | null;
  tipo_propriedade: "proprio" | "alugado" | null;
  projeto_id: string | null;
  created_at: string;
}

export interface VwCustoToneladaDiario {
  data_extracao: string;
  projeto_id: string;
  projeto_nome: string;
  total_toneladas: number;
  custo_operacional_total: number | null;
  custo_combustivel_total: number | null;
  custo_manutencao_total: number | null;
  custo_medio_por_tonelada: number;
}

export interface VwFluxoCaixaComparativo {
  data_referencia: string;
  projeto_id: string;
  entradas_previstas: number | null;
  entradas_realizadas: number | null;
  saidas_previstas: number | null;
  saidas_realizadas: number | null;
  saldo_previsto: number | null;
  saldo_realizado: number | null;
}

export interface AlertaCaixa {
  projeto_id: string;
  projeto_nome: string;
  data_alerta: string;
  saldo_projetado: number;
  mensagem: string;
}

// SaaS: Empresa e licença
export type TipoTenant = "empresa" | "explorador";
export type PlanoLicenca = "trial" | "basico" | "profissional" | "empresarial" | "custom";

export interface Empresa {
  id: string;
  nome: string;
  nuit: string | null;
  tipo_tenant: TipoTenant | null;
  created_at: string;
}

export interface Licenca {
  id: string;
  empresa_id: string;
  plano: PlanoLicenca;
  data_inicio: string;
  data_fim: string;
  ativo: boolean;
  max_usuarios: number | null;
  max_projetos: number | null;
  created_at: string;
}

// Planejamento de missão / simulador
export type CategoriaItemPlano = "equipamentos" | "insumos" | "mao_de_obra" | "servicos";

export interface ItemPredefinido {
  id: string;
  categoria: CategoriaItemPlano;
  nome: string;
  unidade: string;
  custo_estimado_default: number | null;
  descricao: string | null;
  ativo: boolean;
  created_at: string;
}

export interface PlanejamentoMissao {
  id: string;
  projeto_id: string | null;
  nome: string;
  descricao: string | null;
  data_planejamento: string;
  toneladas_estimadas: number | null;
  preco_tonelada_estimado: number | null;
  receita_estimada: number | null;
  template_nome: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlanejamentoMissaoItem {
  id: string;
  planejamento_id: string;
  tipo: "predefinido" | "customizado";
  categoria: CategoriaItemPlano;
  item_predefinido_id: string | null;
  nome: string;
  unidade: string;
  quantidade: number;
  custo_unitario: number;
  custo_total: number;
  ordem: number;
  created_at: string;
}
