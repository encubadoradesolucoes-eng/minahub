-- Produto SaaS: projetos devem estar sempre vinculados a uma empresa.
-- Remove a política que permitia projeto com empresa_id NULL.
DROP POLICY IF EXISTS "projetos_null_empresa_authenticated" ON mining_finance.projetos;
