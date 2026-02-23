-- ============================================================
-- Views: relatórios e indicadores (mining_finance)
-- ============================================================
-- Depende de: 20250222000000_mining_finance_schema.sql
-- RLS das tabelas base se aplica às consultas via view
-- ============================================================

-- VIEW 1: Custo por Tonelada (Diário)
CREATE VIEW mining_finance.vw_custo_tonelada_diario AS
SELECT
    e.data_extracao,
    p.nome AS projeto_nome,
    p.id AS projeto_id,
    SUM(e.toneladas_brutas) AS total_toneladas,
    SUM(e.custo_operacional) AS custo_operacional_total,
    SUM(e.custo_combustivel) AS custo_combustivel_total,
    SUM(e.custo_manutencao) AS custo_manutencao_total,
    CASE
        WHEN SUM(e.toneladas_brutas) > 0
        THEN (COALESCE(SUM(e.custo_operacional), 0) + COALESCE(SUM(e.custo_combustivel), 0) + COALESCE(SUM(e.custo_manutencao), 0)) / SUM(e.toneladas_brutas)
        ELSE 0
    END AS custo_medio_por_tonelada
FROM mining_finance.extracao e
JOIN mining_finance.projetos p ON e.projeto_id = p.id
GROUP BY e.data_extracao, p.id, p.nome;

-- VIEW 2: Fluxo de Caixa Projetado vs Realizado
CREATE VIEW mining_finance.vw_fluxo_caixa_comparativo AS
SELECT
    data_referencia,
    projeto_id,
    SUM(CASE WHEN tipo_movimento = 'previsto' THEN total_entradas ELSE 0 END) AS entradas_previstas,
    SUM(CASE WHEN tipo_movimento = 'realizado' THEN total_entradas ELSE 0 END) AS entradas_realizadas,
    SUM(CASE WHEN tipo_movimento = 'previsto' THEN total_saidas ELSE 0 END) AS saidas_previstas,
    SUM(CASE WHEN tipo_movimento = 'realizado' THEN total_saidas ELSE 0 END) AS saidas_realizadas,
    SUM(CASE WHEN tipo_movimento = 'previsto' THEN saldo_dia ELSE 0 END) AS saldo_previsto,
    SUM(CASE WHEN tipo_movimento = 'realizado' THEN saldo_dia ELSE 0 END) AS saldo_realizado
FROM mining_finance.fluxo_caixa
GROUP BY data_referencia, projeto_id;

-- VIEW 3: Performance de Financiamentos
CREATE VIEW mining_finance.vw_financiamentos_status AS
SELECT
    f.id,
    f.projeto_id,
    f.tipo,
    f.fonte_recursos,
    f.valor_total,
    f.taxa_juros,
    f.prazo_meses,
    f.carencia_meses,
    f.data_contratacao,
    f.data_primeiro_pagamento,
    f.percentual_producao,
    f.preco_fixo,
    f.garantias,
    f.observacoes,
    f.created_at,
    p.nome AS projeto_nome,
    COALESCE((SELECT SUM(a.valor_principal) FROM mining_finance.amortizacoes a WHERE a.financiamento_id = f.id), 0) AS total_amortizado,
    (SELECT COUNT(*) FROM mining_finance.amortizacoes a WHERE a.financiamento_id = f.id AND a.status = 'atrasado') AS parcelas_atrasadas,
    CASE
        WHEN f.valor_total > 0
        THEN (COALESCE((SELECT SUM(a.valor_principal) FROM mining_finance.amortizacoes a WHERE a.financiamento_id = f.id), 0) / f.valor_total * 100)
        ELSE 0
    END AS percentual_pago
FROM mining_finance.financiamentos f
JOIN mining_finance.projetos p ON f.projeto_id = p.id;
