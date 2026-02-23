-- Permite ver e gerenciar projetos sem empresa (empresa_id NULL) para setup inicial.
-- Quando usar multi-tenancy, defina empresa_id nos projetos e vincule usuários em user_empresas.
CREATE POLICY "projetos_null_empresa_authenticated"
ON mining_finance.projetos
FOR ALL
USING (empresa_id IS NULL AND auth.uid() IS NOT NULL);
