-- Esquema principal: mining_finance
CREATE SCHEMA IF NOT EXISTS mining_finance;

-- 1. PROJETOS DE MINERAÇÃO
CREATE TABLE mining_finance.projetos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(200) NOT NULL,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    tipo_projeto VARCHAR(50) CHECK (tipo_projeto IN ('exploracao', 'desenvolvimento', 'producao', 'reabilitacao')),
    status VARCHAR(50) CHECK (status IN ('planejamento', 'ativo', 'pausado', 'concluido')),
    mineral_principal VARCHAR(100),
    localizacao JSONB, -- {estado, municipio, coordenadas}
    data_inicio DATE,
    data_previsao_termino DATE,
    area_hectares DECIMAL(15,2),
    responsavel_tecnico_id UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. CONTROLE DE EXTRAÇÃO (Produção)
CREATE TABLE mining_finance.extracao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id UUID REFERENCES mining_finance.projetos(id),
    data_extracao DATE NOT NULL,
    turno VARCHAR(20) CHECK (turno IN ('manha', 'tarde', 'noite')),
    frente_trabalho VARCHAR(100),
    equipamento_id UUID,

    -- Métricas de produção
    toneladas_brutas DECIMAL(15,2) NOT NULL,
    teor_medio DECIMAL(10,4), -- Percentual do mineral
    toneladas_uteis DECIMAL(15,2) GENERATED ALWAYS AS (toneladas_brutas * teor_medio/100) STORED,

    -- Custos associados
    custo_operacional DECIMAL(15,2),
    custo_combustivel DECIMAL(15,2),
    custo_manutencao DECIMAL(15,2),

    observacoes TEXT,
    created_by UUID,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. CONTROLE DE EQUIPAMENTOS (Ativo Fixo)
CREATE TABLE mining_finance.equipamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(200) NOT NULL,
    tipo VARCHAR(50) CHECK (tipo IN ('caminhao', 'escavadeira', 'perfuratriz', 'britador', 'gerador', 'outros')),
    marca VARCHAR(100),
    modelo VARCHAR(100),
    ano_fabricacao INTEGER,

    -- Dados financeiros
    valor_aquisicao DECIMAL(15,2),
    data_aquisicao DATE,
    vida_util_anos INTEGER,
    valor_residual DECIMAL(15,2),
    depreciacao_mensal DECIMAL(15,2) GENERATED ALWAYS AS
        ((valor_aquisicao - valor_residual) / NULLIF(vida_util_anos * 12, 0)) STORED,

    -- Controle operacional
    horas_trabalhadas_total INTEGER DEFAULT 0,
    consumo_medio_combustivel DECIMAL(10,2), -- Litros/hora
    status VARCHAR(50) CHECK (status IN ('operacional', 'manutencao', 'inativo')),

    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. FINANCIAMENTOS (Project Finance)
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

    -- Para streaming/royalty
    percentual_producao DECIMAL(5,2), -- % da produção comprometida
    preco_fixo DECIMAL(15,2), -- Preço acordado para streaming

    garantias TEXT,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 5. AMORTIZAÇÕES (Pagamentos de financiamentos)
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

-- 6. CONTAS A PAGAR (Despesas operacionais)
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

    -- Campos para recuperação de impostos (setor mineral)
    credito_icms DECIMAL(15,2) DEFAULT 0,
    credito_ipi DECIMAL(15,2) DEFAULT 0,
    credito_pis_cofins DECIMAL(15,2) DEFAULT 0,

    comprovante_url TEXT[], -- Links para fotos/faturas no Storage
    status VARCHAR(20) CHECK (status IN ('pendente', 'pago', 'cancelado')),
    forma_pagamento VARCHAR(50),
    created_by UUID,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 7. CONTAS A RECEBER (Vendas de minério)
CREATE TABLE mining_finance.contas_receber (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id UUID REFERENCES mining_finance.projetos(id),
    cliente_id UUID,
    contrato_id UUID,

    -- Dados da venda
    nota_fiscal VARCHAR(50),
    quantidade_toneladas DECIMAL(15,2) NOT NULL,
    preco_tonelada DECIMAL(15,2) NOT NULL,
    teor_real DECIMAL(10,4), -- Teor efetivamente entregue
    valor_bruto DECIMAL(15,2) GENERATED ALWAYS AS (quantidade_toneladas * preco_tonelada) STORED,

    -- Tributos sobre venda
    cfem DECIMAL(15,2), -- Compensação Financeira pela Exploração Mineral
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

-- 8. CONTRATOS DE VENDA (Offtakes)
CREATE TABLE mining_finance.contratos_venda (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id UUID REFERENCES mining_finance.projetos(id),
    cliente_id UUID,
    numero_contrato VARCHAR(100) UNIQUE NOT NULL,
    tipo_contrato VARCHAR(50) CHECK (tipo_contrato IN ('spot', 'longo_prazo', 'offtake')),

    -- Condições comerciais
    volume_total_toneladas DECIMAL(15,2),
    preco_referencia VARCHAR(50), -- Ex: "LME - 15%", "Fixado"
    periodicidade_entrega VARCHAR(20),

    -- Para pré-pagamento (financiamento)
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

-- 9. FLUXO DE CAIXA (Consolidado)
CREATE TABLE mining_finance.fluxo_caixa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id UUID REFERENCES mining_finance.projetos(id),
    data_referencia DATE NOT NULL,
    tipo_movimento VARCHAR(20) CHECK (tipo_movimento IN ('previsto', 'realizado')),

    -- Entradas
    receita_vendas DECIMAL(15,2) DEFAULT 0,
    receita_financeira DECIMAL(15,2) DEFAULT 0,
    outros_recebimentos DECIMAL(15,2) DEFAULT 0,

    -- Saídas
    custo_operacional DECIMAL(15,2) DEFAULT 0,
    custo_pessoal DECIMAL(15,2) DEFAULT 0,
    custo_manutencao DECIMAL(15,2) DEFAULT 0,
    impostos_recolher DECIMAL(15,2) DEFAULT 0,
    amortizacoes DECIMAL(15,2) DEFAULT 0,
    investimentos DECIMAL(15,2) DEFAULT 0,

    -- Totais calculados
    total_entradas DECIMAL(15,2) GENERATED ALWAYS AS (
        receita_vendas + receita_financeira + outros_recebimentos
    ) STORED,

    total_saidas DECIMAL(15,2) GENERATED ALWAYS AS (
        custo_operacional + custo_pessoal + custo_manutencao +
        impostos_recolher + amortizacoes + investimentos
    ) STORED,

    saldo_dia DECIMAL(15,2) GENERATED ALWAYS AS (total_entradas - total_saidas) STORED,

    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(projeto_id, data_referencia, tipo_movimento)
);

-- 10. INDICADORES (KPIs calculados)
CREATE TABLE mining_finance.kpis_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    projeto_id UUID REFERENCES mining_finance.projetos(id),
    data_referencia DATE NOT NULL,

    -- KPIs operacionais
    custo_tonelada_extraida DECIMAL(15,2),
    custo_tonelada_util DECIMAL(15,2),
    produtividade_hora DECIMAL(15,2), -- Toneladas/hora

    -- KPIs financeiros
    aisc DECIMAL(15,2), -- All-in Sustaining Cost
    margem_contribuicao DECIMAL(5,2), -- Percentual
    ebitda DECIMAL(15,2),

    -- KPIs de endividamento
    divida_liquida DECIMAL(15,2),
    alavancagem DECIMAL(5,2), -- Dívida Líquida/EBITDA

    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para consultas frequentes
CREATE INDEX idx_extracao_projeto_data ON mining_finance.extracao(projeto_id, data_extracao);
CREATE INDEX idx_contas_pagar_vencimento ON mining_finance.contas_pagar(data_vencimento, status);
CREATE INDEX idx_contas_receber_vencimento ON mining_finance.contas_receber(data_vencimento, status);
CREATE INDEX idx_fluxo_caixa_projeto_data ON mining_finance.fluxo_caixa(projeto_id, data_referencia);
CREATE INDEX idx_amortizacoes_financiamento ON mining_finance.amortizacoes(financiamento_id, data_vencimento);

-- Trigger para updated_at em projetos
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
