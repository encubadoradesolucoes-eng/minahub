-- ============================================================
-- Alerta de caixa: saldo projetado negativo (próximos 30 dias)
-- ============================================================

CREATE OR REPLACE FUNCTION mining_finance.verificar_alerta_caixa()
RETURNS TABLE (
    projeto_id UUID,
    projeto_nome TEXT,
    data_alerta DATE,
    saldo_projetado DECIMAL(15,2),
    mensagem TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = mining_finance, public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        p.nome::TEXT,
        fc.data_referencia,
        fc.saldo_previsto,
        ('ALERTA: Saldo de caixa projetado negativo em ' || TO_CHAR(fc.data_referencia, 'DD/MM/YYYY'))::TEXT
    FROM mining_finance.vw_fluxo_caixa_comparativo fc
    JOIN mining_finance.projetos p ON fc.projeto_id = p.id
    WHERE fc.saldo_previsto < 0
      AND fc.data_referencia >= CURRENT_DATE
      AND fc.data_referencia <= CURRENT_DATE + INTERVAL '30 days'
    ORDER BY fc.data_referencia, p.nome;
END;
$$;
