-- ============================================================
-- RLS: Estrutura de multi-tenancy (empresa) e políticas
-- ============================================================
-- Depende de: 20250222000000_mining_finance_schema.sql
-- Em Supabase, role do app costuma vir em app_metadata.role
-- ============================================================

-- 1. Tabela de empresas (multi-tenancy)
CREATE TABLE IF NOT EXISTS mining_finance.empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(200) NOT NULL,
    cnpj VARCHAR(18),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Vínculo usuário <-> empresa (um usuário pode ter várias empresas)
CREATE TABLE IF NOT EXISTS mining_finance.user_empresas (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    empresa_id UUID NOT NULL REFERENCES mining_finance.empresas(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, empresa_id)
);

-- 3. Coluna empresa_id em projetos (se ainda não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'mining_finance'
          AND table_name = 'projetos'
          AND column_name = 'empresa_id'
    ) THEN
        ALTER TABLE mining_finance.projetos
        ADD COLUMN empresa_id UUID REFERENCES mining_finance.empresas(id);
    END IF;
END $$;

-- Função auxiliar: usuário pertence à empresa do contexto
CREATE OR REPLACE FUNCTION mining_finance.user_pertence_empresa(empresa_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM mining_finance.user_empresas
        WHERE user_id = auth.uid() AND empresa_id = empresa_uuid
    );
$$;

-- Função auxiliar: role do usuário no JWT (app_metadata.role)
CREATE OR REPLACE FUNCTION mining_finance.user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
    SELECT COALESCE(
        auth.jwt() -> 'app_metadata' ->> 'role',
        auth.jwt() ->> 'role'
    );
$$;

-- ============================================================
-- Habilitar RLS nas tabelas
-- ============================================================
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

-- RLS em tabelas de suporte (somente usuários da empresa veem)
ALTER TABLE mining_finance.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mining_finance.user_empresas ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Políticas: PROJETOS
-- Usuários veem apenas projetos da sua empresa
-- ============================================================
CREATE POLICY "projetos_select_empresa"
ON mining_finance.projetos
FOR SELECT
USING (mining_finance.user_pertence_empresa(empresa_id));

CREATE POLICY "projetos_insert_empresa"
ON mining_finance.projetos
FOR INSERT
WITH CHECK (mining_finance.user_pertence_empresa(empresa_id));

CREATE POLICY "projetos_update_empresa"
ON mining_finance.projetos
FOR UPDATE
USING (mining_finance.user_pertence_empresa(empresa_id));

CREATE POLICY "projetos_delete_empresa"
ON mining_finance.projetos
FOR DELETE
USING (mining_finance.user_pertence_empresa(empresa_id));

-- ============================================================
-- Políticas: EXTRAÇÃO
-- Operadores/gerente produção podem inserir; leitura pela empresa do projeto
-- ============================================================
CREATE POLICY "extracao_select_projeto_empresa"
ON mining_finance.extracao
FOR SELECT
USING (
    mining_finance.user_pertence_empresa(
        (SELECT empresa_id FROM mining_finance.projetos WHERE id = extracao.projeto_id)
    )
);

CREATE POLICY "operadores_inserem_extracao"
ON mining_finance.extracao
FOR INSERT
WITH CHECK (
    mining_finance.user_role() IN ('operador', 'gerente_producao')
    AND mining_finance.user_pertence_empresa(
        (SELECT empresa_id FROM mining_finance.projetos WHERE id = projeto_id)
    )
);

CREATE POLICY "extracao_update_projeto_empresa"
ON mining_finance.extracao
FOR UPDATE
USING (
    mining_finance.user_pertence_empresa(
        (SELECT empresa_id FROM mining_finance.projetos WHERE id = extracao.projeto_id)
    )
);

CREATE POLICY "extracao_delete_projeto_empresa"
ON mining_finance.extracao
FOR DELETE
USING (
    mining_finance.user_pertence_empresa(
        (SELECT empresa_id FROM mining_finance.projetos WHERE id = extracao.projeto_id)
    )
);

-- ============================================================
-- Políticas: CONTAS A PAGAR
-- Gerente financeiro acesso total; demais veem pela empresa do projeto
-- ============================================================
CREATE POLICY "contas_pagar_gerente_full"
ON mining_finance.contas_pagar
FOR ALL
USING (mining_finance.user_role() = 'gerente_financeiro');

CREATE POLICY "contas_pagar_empresa"
ON mining_finance.contas_pagar
FOR ALL
USING (
    mining_finance.user_pertence_empresa(
        (SELECT empresa_id FROM mining_finance.projetos WHERE id = contas_pagar.projeto_id)
    )
);

-- ============================================================
-- Políticas: CONTAS A RECEBER
-- Mesmo critério: gerente financeiro ou por empresa do projeto
-- ============================================================
CREATE POLICY "contas_receber_gerente_full"
ON mining_finance.contas_receber
FOR ALL
USING (mining_finance.user_role() = 'gerente_financeiro');

CREATE POLICY "contas_receber_empresa"
ON mining_finance.contas_receber
FOR ALL
USING (
    mining_finance.user_pertence_empresa(
        (SELECT empresa_id FROM mining_finance.projetos WHERE id = contas_receber.projeto_id)
    )
);

-- ============================================================
-- Políticas: demais tabelas por empresa do projeto
-- (equipamentos, financiamentos, amortizacoes, contratos_venda,
--  fluxo_caixa, kpis_history)
-- ============================================================
-- Equipamentos: sem vínculo com projeto/empresa no schema atual.
-- Apenas usuários autenticados; para multi-tenant, adicione empresa_id e troque por user_pertence_empresa(empresa_id).
CREATE POLICY "equipamentos_authenticated"
ON mining_finance.equipamentos
FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "financiamentos_empresa"
ON mining_finance.financiamentos
FOR ALL
USING (
    mining_finance.user_pertence_empresa(
        (SELECT empresa_id FROM mining_finance.projetos WHERE id = financiamentos.projeto_id)
    )
);

CREATE POLICY "amortizacoes_empresa"
ON mining_finance.amortizacoes
FOR ALL
USING (
    mining_finance.user_pertence_empresa(
        (SELECT empresa_id FROM mining_finance.financiamentos f
         JOIN mining_finance.projetos p ON p.id = f.projeto_id
         WHERE f.id = amortizacoes.financiamento_id)
    )
);

CREATE POLICY "contratos_venda_empresa"
ON mining_finance.contratos_venda
FOR ALL
USING (
    mining_finance.user_pertence_empresa(
        (SELECT empresa_id FROM mining_finance.projetos WHERE id = contratos_venda.projeto_id)
    )
);

CREATE POLICY "fluxo_caixa_empresa"
ON mining_finance.fluxo_caixa
FOR ALL
USING (
    mining_finance.user_pertence_empresa(
        (SELECT empresa_id FROM mining_finance.projetos WHERE id = fluxo_caixa.projeto_id)
    )
);

CREATE POLICY "kpis_history_empresa"
ON mining_finance.kpis_history
FOR ALL
USING (
    mining_finance.user_pertence_empresa(
        (SELECT empresa_id FROM mining_finance.projetos WHERE id = kpis_history.projeto_id)
    )
);

-- Empresas: usuário só vê empresas em que está vinculado
CREATE POLICY "empresas_select_user"
ON mining_finance.empresas
FOR SELECT
USING (
    id IN (SELECT empresa_id FROM mining_finance.user_empresas WHERE user_id = auth.uid())
);

-- user_empresas: usuário vê apenas seus próprios vínculos
CREATE POLICY "user_empresas_own"
ON mining_finance.user_empresas
FOR ALL
USING (user_id = auth.uid());
