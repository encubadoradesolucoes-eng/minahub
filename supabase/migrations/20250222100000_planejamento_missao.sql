-- ============================================================
-- Planejamento de Missão / Simulador de custos logísticos
-- ============================================================
-- Itens predefinidos (equipamentos, insumos, mão de obra, serviços)
-- + itens customizados por plano
-- Cálculos: custo total, custo/tonelada, ROI estimado, ponto de equilíbrio
-- ============================================================

-- Categorias de itens predefinidos
CREATE TABLE mining_finance.itens_predefinidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('equipamentos', 'insumos', 'mao_de_obra', 'servicos')),
    nome VARCHAR(200) NOT NULL,
    unidade VARCHAR(30) NOT NULL DEFAULT 'un',
    custo_estimado_default DECIMAL(15,2),
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Planejamento de missão (cabeçalho)
CREATE TABLE mining_finance.planejamento_missao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id UUID REFERENCES mining_finance.projetos(id),
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    data_planejamento DATE DEFAULT CURRENT_DATE,
    -- Para cálculos
    toneladas_estimadas DECIMAL(15,2),           -- produção esperada (ton)
    preco_tonelada_estimado DECIMAL(15,2),       -- preço de venda por ton (para ROI e PE)
    receita_estimada DECIMAL(15,2),              -- opcional: override direto da receita
    -- Metadados
    template_nome VARCHAR(200),                  -- se salvo como template
    created_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Itens do planejamento (predefinidos + customizados)
CREATE TABLE mining_finance.planejamento_missao_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    planejamento_id UUID NOT NULL REFERENCES mining_finance.planejamento_missao(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('predefinido', 'customizado')),
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('equipamentos', 'insumos', 'mao_de_obra', 'servicos')),
    item_predefinido_id UUID REFERENCES mining_finance.itens_predefinidos(id),
    nome VARCHAR(200) NOT NULL,
    unidade VARCHAR(30) NOT NULL DEFAULT 'un',
    quantidade DECIMAL(15,4) NOT NULL DEFAULT 1,
    custo_unitario DECIMAL(15,2) NOT NULL DEFAULT 0,
    custo_total DECIMAL(15,2) GENERATED ALWAYS AS (quantidade * custo_unitario) STORED,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_planejamento_missao_projeto ON mining_finance.planejamento_missao(projeto_id);
CREATE INDEX idx_planejamento_missao_itens_plan ON mining_finance.planejamento_missao_itens(planejamento_id);

-- Trigger updated_at
CREATE TRIGGER planejamento_missao_updated_at
    BEFORE UPDATE ON mining_finance.planejamento_missao
    FOR EACH ROW EXECUTE FUNCTION mining_finance.set_updated_at();

-- Inserir itens predefinidos iniciais (exemplos)
INSERT INTO mining_finance.itens_predefinidos (categoria, nome, unidade, custo_estimado_default) VALUES
('equipamentos', 'Caminhão (aluguel/dia)', 'dia', 3500),
('equipamentos', 'Escavadeira (aluguel/dia)', 'dia', 5500),
('equipamentos', 'Perfuratriz (operação/dia)', 'dia', 2800),
('insumos', 'Combustível diesel', 'L', 5.80),
('insumos', 'Explosivos', 'kg', 12.00),
('insumos', 'Óleo lubrificante', 'L', 28.00),
('mao_de_obra', 'Operador de equipamento', 'dia', 450),
('mao_de_obra', 'Auxiliar de campo', 'dia', 280),
('mao_de_obra', 'Supervisor', 'dia', 650),
('servicos', 'Frete (caminhão)', 'viagem', 1200),
('servicos', 'Análise laboratorial', 'amostra', 350),
('servicos', 'Seguro de equipamento', 'mês', 1800);

-- RLS
ALTER TABLE mining_finance.itens_predefinidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE mining_finance.planejamento_missao ENABLE ROW LEVEL SECURITY;
ALTER TABLE mining_finance.planejamento_missao_itens ENABLE ROW LEVEL SECURITY;

-- Itens predefinidos: leitura para todos autenticados
CREATE POLICY "itens_predefinidos_read"
ON mining_finance.itens_predefinidos FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Planejamento: por empresa do projeto ou plano sem projeto (usuário autenticado)
CREATE POLICY "planejamento_missao_all"
ON mining_finance.planejamento_missao FOR ALL
USING (
    (projeto_id IS NULL AND auth.uid() IS NOT NULL)
    OR mining_finance.user_pertence_empresa((SELECT empresa_id FROM mining_finance.projetos WHERE id = planejamento_missao.projeto_id))
);

-- Itens do planejamento: quem pode ver o plano pode ver/editar itens
CREATE POLICY "planejamento_missao_itens_all"
ON mining_finance.planejamento_missao_itens FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM mining_finance.planejamento_missao p
        LEFT JOIN mining_finance.projetos pr ON pr.id = p.projeto_id
        WHERE p.id = planejamento_missao_itens.planejamento_id
          AND (
              (p.projeto_id IS NULL AND auth.uid() IS NOT NULL)
              OR mining_finance.user_pertence_empresa(pr.empresa_id)
          )
    )
);
