-- ===================================================================
-- MINEHUB - SCRIPT COMPLETO CORRIGIDO
-- Execute em ordem no Supabase SQL Editor
-- ===================================================================

-- 1. SCHEMA PRINCIPAL
CREATE SCHEMA IF NOT EXISTS mining_finance;

-- 2. TABELAS SAAS (Multi-tenant)
CREATE TABLE mining_finance.empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(200) NOT NULL,
    cnpj VARCHAR(20) UNIQUE,
    tipo VARCHAR(20) CHECK (tipo IN ('empresa', 'explorador_individual')),
    responsavel_nome VARCHAR(200),
    responsavel_email VARCHAR(200),
    responsavel_telefone VARCHAR(30),
    endereco JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE mining_finance.licencas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES mining_finance.empresas(id) ON DELETE CASCADE,
    plano VARCHAR(20) CHECK (plano IN ('trial', 'basico', 'profissional', 'empresarial', 'custom')),
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    limite_projetos INTEGER,
    limite_usuarios INTEGER,
    valor_mensal DECIMAL(10,2),
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(empresa_id, ativo)
);

CREATE TABLE mining_finance.user_empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    empresa_id UUID REFERENCES mining_finance.empresas(id) ON DELETE CASCADE,
    papel VARCHAR(20) CHECK (papel IN ('admin', 'gerente', 'operador')),
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, empresa_id)
);

-- 3. TABELAS PRINCIPAIS
CREATE TABLE mining_finance.projetos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(200) NOT NULL,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    tipo_projeto VARCHAR(50) CHECK (tipo_projeto IN ('exploracao', 'desenvolvimento', 'producao', 'reabilitacao')),
    status VARCHAR(50) CHECK (status IN ('planejamento', 'ativo', 'pausado', 'concluido')),
    mineral_principal VARCHAR(100),
    localizacao JSONB,
    data_inicio DATE,
    data_previsao_termino DATE,
    area_hectares DECIMAL(15,2),
    responsavel_tecnico_id UUID,
    empresa_id UUID NOT NULL REFERENCES mining_finance.empresas(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE mining_finance.equipamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(200) NOT NULL,
    tipo VARCHAR(50) CHECK (tipo IN ('caminhao', 'escavadeira', 'perfuratriz', 'britador', 'gerador', 'outros')),
    marca VARCHAR(100),
    modelo VARCHAR(100),
    ano_fabricacao INTEGER,
    valor_aquisicao DECIMAL(15,2),
    data_aquisicao DATE,
    vida_util_anos INTEGER,
    valor_residual DECIMAL(15,2),
    depreciacao_mensal DECIMAL(15,2) GENERATED ALWAYS AS
        ((valor_aquisicao - valor_residual) / NULLIF(vida_util_anos * 12, 0)) STORED,
    horas_trabalhadas_total INTEGER DEFAULT 0,
    consumo_medio_combustivel DECIMAL(10,2),
    status VARCHAR(50) CHECK (status IN ('operacional', 'manutencao', 'inativo')),
    empresa_id UUID NOT NULL REFERENCES mining_finance.empresas(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE mining_finance.extracao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id UUID REFERENCES mining_finance.projetos(id),
    data_extracao DATE NOT NULL,
    turno VARCHAR(20) CHECK (turno IN ('manha', 'tarde', 'noite')),
    frente_trabalho VARCHAR(100),
    equipamento_id UUID,
    toneladas_brutas DECIMAL(15,2) NOT NULL,
    teor_medio DECIMAL(10,4),
    toneladas_uteis DECIMAL(15,2) GENERATED ALWAYS AS (toneladas_brutas * teor_medio/100) STORED,
    custo_operacional DECIMAL(15,2),
    custo_combustivel DECIMAL(15,2),
    custo_manutencao DECIMAL(15,2),
    observacoes TEXT,
    created_by UUID,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE mining_finance.financiamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id UUID REFERENCES mining_finance.projetos(id),
    tipo VARCHAR(50) CHECK (tipo IN ('equity', 'debenture', 'project_finance', 'streaming', 'royalty', 'offtake_pre_pagamento')),
    fonte_recursos VARCHAR(200),
    valor_total DECIMAL(15,2) NOT NULL,
    taxa_juros DECIMAL(8,4),
    prazo_meses INTEGER,
    carencia_meses INTEGER DEFAULT 0,
    data_contratacao DATE,
    data_primeiro_pagamento DATE,
    percentual_producao DECIMAL(5,2),
    preco_fixo DECIMAL(15,2),
    garantias TEXT,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE mining_finance.amortizacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    financiamento_id UUID REFERENCES mining_finance.financiamentos(id),
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    valor_principal DECIMAL(15,2) NOT NULL,
    valor_juros DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('pendente', 'pago', 'atrasado')),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE mining_finance.contas_pagar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id UUID REFERENCES mining_finance.projetos(id),
    fornecedor_id UUID,
    categoria VARCHAR(50) CHECK (categoria IN (
        'combustivel', 'energia', 'agua', 'manutencao',
        'aluguel', 'salarios', 'encargos', 'frete',
        'insumos', 'servicos_terceiros', 'outros'
    )),
    descricao TEXT NOT NULL,
    valor_bruto DECIMAL(15,2) NOT NULL,
    impostos DECIMAL(15,2) DEFAULT 0,
    valor_liquido DECIMAL(15,2) GENERATED ALWAYS AS (valor_bruto - impostos) STORED,
    data_emissao DATE NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    credito_icms DECIMAL(15,2) DEFAULT 0,
    credito_ipi DECIMAL(15,2) DEFAULT 0,
    credito_pis_cofins DECIMAL(15,2) DEFAULT 0,
    comprovante_url TEXT[],
    status VARCHAR(20) CHECK (status IN ('pendente', 'pago', 'cancelado')),
    forma_pagamento VARCHAR(50),
    created_by UUID,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE mining_finance.contas_receber (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id UUID REFERENCES mining_finance.projetos(id),
    cliente_id UUID,
    contrato_id UUID,
    nota_fiscal VARCHAR(50),
    quantidade_toneladas DECIMAL(15,2) NOT NULL,
    preco_tonelada DECIMAL(15,2) NOT NULL,
    teor_real DECIMAL(10,4),
    valor_bruto DECIMAL(15,2) NOT NULL,
    cfem DECIMAL(15,2),
    iss DECIMAL(15,2),
    icms DECIMAL(15,2),
    valor_liquido DECIMAL(15,2) GENERATED ALWAYS AS (
        valor_bruto - COALESCE(cfem,0) - COALESCE(iss,0) - COALESCE(icms,0)
    ) STORED,
    data_embarque DATE,
    data_vencimento DATE NOT NULL,
    data_recebimento DATE,
    status VARCHAR(20) CHECK (status IN ('emitida', 'faturada', 'recebida', 'cancelada')),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE mining_finance.contratos_venda (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id UUID REFERENCES mining_finance.projetos(id),
    cliente_id UUID,
    numero_contrato VARCHAR(100) UNIQUE NOT NULL,
    tipo_contrato VARCHAR(50) CHECK (tipo_contrato IN ('spot', 'longo_prazo', 'offtake')),
    volume_total_toneladas DECIMAL(15,2),
    preco_referencia VARCHAR(50),
    periodicidade_entrega VARCHAR(20),
    tem_pre_pagamento BOOLEAN DEFAULT FALSE,
    valor_pre_pagamento DECIMAL(15,2),
    saldo_pre_pagamento DECIMAL(15,2),
    data_pre_pagamento DATE,
    data_inicio DATE NOT NULL,
    data_fim DATE,
    clausulas TEXT,
    status VARCHAR(20) CHECK (status IN ('vigente', 'encerrado', 'cancelado')),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE mining_finance.fluxo_caixa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id UUID REFERENCES mining_finance.projetos(id),
    data_referencia DATE NOT NULL,
    tipo_movimento VARCHAR(20) CHECK (tipo_movimento IN ('previsto', 'realizado')),
    receita_vendas DECIMAL(15,2) DEFAULT 0,
    receita_financeira DECIMAL(15,2) DEFAULT 0,
    outros_recebimentos DECIMAL(15,2) DEFAULT 0,
    custo_operacional DECIMAL(15,2) DEFAULT 0,
    custo_pessoal DECIMAL(15,2) DEFAULT 0,
    custo_manutencao DECIMAL(15,2) DEFAULT 0,
    impostos_recolher DECIMAL(15,2) DEFAULT 0,
    amortizacoes DECIMAL(15,2) DEFAULT 0,
    investimentos DECIMAL(15,2) DEFAULT 0,
    total_entradas DECIMAL(15,2) GENERATED ALWAYS AS (
        receita_vendas + receita_financeira + outros_recebimentos
    ) STORED,
    total_saidas DECIMAL(15,2) GENERATED ALWAYS AS (
        custo_operacional + custo_pessoal + custo_manutencao +
        impostos_recolher + amortizacoes + investimentos
    ) STORED,
    saldo_dia DECIMAL(15,2) GENERATED ALWAYS AS (
        (receita_vendas + receita_financeira + outros_recebimentos) -
        (custo_operacional + custo_pessoal + custo_manutencao +
         impostos_recolher + amortizacoes + investimentos)
    ) STORED,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(projeto_id, data_referencia, tipo_movimento)
);

CREATE TABLE mining_finance.kpis_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id UUID REFERENCES mining_finance.projetos(id),
    data_referencia DATE NOT NULL,
    custo_tonelada_extraida DECIMAL(15,2),
    custo_tonelada_util DECIMAL(15,2),
    produtividade_hora DECIMAL(15,2),
    aisc DECIMAL(15,2),
    margem_contribuicao DECIMAL(5,2),
    ebitda DECIMAL(15,2),
    divida_liquida DECIMAL(15,2),
    alavancagem DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. ÍNDICES
CREATE INDEX idx_extracao_projeto_data ON mining_finance.extracao(projeto_id, data_extracao);
CREATE INDEX idx_contas_pagar_vencimento ON mining_finance.contas_pagar(data_vencimento, status);
CREATE INDEX idx_contas_receber_vencimento ON mining_finance.contas_receber(data_vencimento, status);
CREATE INDEX idx_fluxo_caixa_projeto_data ON mining_finance.fluxo_caixa(projeto_id, data_referencia);
CREATE INDEX idx_amortizacoes_financiamento ON mining_finance.amortizacoes(financiamento_id, data_vencimento);

-- 5. TRIGGERS
CREATE OR REPLACE FUNCTION mining_finance.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projetos_updated_at
    BEFORE UPDATE ON mining_finance.projetos
    FOR EACH ROW EXECUTE FUNCTION mining_finance.set_updated_at();

-- 6. VIEWS
CREATE VIEW mining_finance.v_dashboard_financeiro AS
SELECT 
    p.id as projeto_id,
    p.nome as projeto_nome,
    e.nome as empresa_nome,
    COALESCE(cr.valor_liquido, 0) as total_receber,
    COALESCE(cp.valor_liquido, 0) as total_pagar,
    COALESCE(cr.valor_liquido, 0) - COALESCE(cp.valor_liquido, 0) as saldo_liquido,
    COALESCE(cr.contas_count, 0) as contas_receber_count,
    COALESCE(cp.contas_count, 0) as contas_pagar_count
FROM mining_finance.projetos p
JOIN mining_finance.empresas e ON p.empresa_id = e.id
LEFT JOIN (
    SELECT 
        projeto_id, 
        SUM(valor_liquido) as valor_liquido, 
        COUNT(*) as contas_count
    FROM mining_finance.contas_receber 
    WHERE status IN ('emitida', 'faturada')
    GROUP BY projeto_id
) cr ON p.id = cr.projeto_id
LEFT JOIN (
    SELECT 
        projeto_id, 
        SUM(valor_liquido) as valor_liquido, 
        COUNT(*) as contas_count
    FROM mining_finance.contas_pagar 
    WHERE status = 'pendente'
    GROUP BY projeto_id
) cp ON p.id = cp.projeto_id;

-- 7. RLS (Row Level Security)
ALTER TABLE mining_finance.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mining_finance.licencas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mining_finance.user_empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mining_finance.projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE mining_finance.extracao ENABLE ROW LEVEL SECURITY;
ALTER TABLE mining_finance.equipamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE mining_finance.financiamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE mining_finance.amortizacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mining_finance.contas_pagar ENABLE ROW LEVEL SECURITY;
ALTER TABLE mining_finance.contas_receber ENABLE ROW LEVEL SECURITY;
ALTER TABLE mining_finance.contratos_venda ENABLE ROW LEVEL SECURITY;
ALTER TABLE mining_finance.fluxo_caixa ENABLE ROW LEVEL SECURITY;
ALTER TABLE mining_finance.kpis_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuários só podem ver empresas vinculadas" ON mining_finance.empresas
    FOR ALL USING (
        id IN (
            SELECT empresa_id FROM mining_finance.user_empresas 
            WHERE user_id = auth.uid() AND ativo = TRUE
        )
    );

CREATE POLICY "Projetos visíveis apenas para empresa" ON mining_finance.projetos
    FOR ALL USING (
        empresa_id IN (
            SELECT empresa_id FROM mining_finance.user_empresas 
            WHERE user_id = auth.uid() AND ativo = TRUE
        )
    );

CREATE POLICY "Usuários podem ver próprios vínculos" ON mining_finance.user_empresas
    FOR SELECT USING (user_id = auth.uid());

-- ===================================================================
-- FIM DO SCRIPT
-- ===================================================================
