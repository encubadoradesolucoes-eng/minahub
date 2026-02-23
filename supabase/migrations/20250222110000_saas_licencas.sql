-- ============================================================
-- SaaS: Uso via licença por empresa/explorador
-- ============================================================
-- Todas empresas ou exploradores devem se cadastrar; uso somente
-- com licença ativa (trial, básica, profissional, etc.).
-- ============================================================

-- Tipo de tenant (empresa ou explorador individual)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'mining_finance' AND table_name = 'empresas' AND column_name = 'tipo_tenant'
    ) THEN
        ALTER TABLE mining_finance.empresas
        ADD COLUMN tipo_tenant VARCHAR(20) DEFAULT 'empresa'
            CHECK (tipo_tenant IN ('empresa', 'explorador'));
    END IF;
END $$;

-- Planos de licença
CREATE TABLE IF NOT EXISTS mining_finance.licencas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES mining_finance.empresas(id) ON DELETE CASCADE,
    plano VARCHAR(50) NOT NULL CHECK (plano IN ('trial', 'basico', 'profissional', 'empresarial', 'custom')),
    data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    data_fim DATE NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT true,
    max_usuarios INTEGER,
    max_projetos INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT chk_data_fim CHECK (data_fim >= data_inicio)
);

CREATE UNIQUE INDEX idx_licencas_empresa_ativa ON mining_finance.licencas(empresa_id)
    WHERE ativo = true;

CREATE INDEX idx_licencas_empresa_fim ON mining_finance.licencas(empresa_id, data_fim);

-- Função: empresa tem licença ativa?
CREATE OR REPLACE FUNCTION mining_finance.empresa_tem_licenca_ativa(empresa_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = mining_finance, public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM mining_finance.licencas
        WHERE empresa_id = empresa_uuid
          AND ativo = true
          AND data_fim >= CURRENT_DATE
    );
$$;

-- Função: usuário tem pelo menos uma empresa com licença ativa?
CREATE OR REPLACE FUNCTION mining_finance.user_tem_licenca_ativa()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = mining_finance, public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM mining_finance.user_empresas ue
        JOIN mining_finance.licencas l ON l.empresa_id = ue.empresa_id
        WHERE ue.user_id = auth.uid()
          AND l.ativo = true
          AND l.data_fim >= CURRENT_DATE
    );
$$;

-- RLS licencas
ALTER TABLE mining_finance.licencas ENABLE ROW LEVEL SECURITY;

-- Usuário vê licenças das suas empresas
CREATE POLICY "licencas_select_own_empresa"
ON mining_finance.licencas FOR SELECT
USING (mining_finance.user_pertence_empresa(empresa_id));

-- Usuário pode inserir licença para empresa que pertence (ex.: trial no cadastro)
CREATE POLICY "licencas_insert_own_empresa"
ON mining_finance.licencas FOR INSERT
WITH CHECK (mining_finance.user_pertence_empresa(empresa_id));

-- Atualizar apenas admin ou sistema; por segurança, restringir update (opcional)
-- Para renovar, pode-se inserir nova licença e desativar a antiga.
CREATE POLICY "licencas_update_own_empresa"
ON mining_finance.licencas FOR UPDATE
USING (mining_finance.user_pertence_empresa(empresa_id));

-- Cadastro: usuário pode criar nova empresa (self-signup)
CREATE POLICY "empresas_insert_authenticated"
ON mining_finance.empresas FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);
