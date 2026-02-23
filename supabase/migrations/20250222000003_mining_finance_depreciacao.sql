-- ============================================================
-- Depreciação mensal: função + agendamento (pg_cron)
-- ============================================================
-- Nota: mining_finance.equipamentos não tem projeto_id no schema atual.
-- Contas a pagar de depreciação são criadas com projeto_id NULL.
-- Se vincular equipamentos a projeto depois, altere a função para usar equip.projeto_id.
-- ============================================================

-- Incluir categoria 'depreciacao' em contas_pagar
ALTER TABLE mining_finance.contas_pagar
DROP CONSTRAINT IF EXISTS contas_pagar_categoria_check;

ALTER TABLE mining_finance.contas_pagar
ADD CONSTRAINT contas_pagar_categoria_check CHECK (categoria IN (
    'combustivel', 'energia', 'agua', 'manutencao',
    'aluguel', 'salarios', 'encargos', 'frete',
    'insumos', 'servicos_terceiros', 'depreciacao', 'outros'
));

-- Função para calcular e registrar depreciação mensal
CREATE OR REPLACE FUNCTION mining_finance.calcular_depreciacao_mensal()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = mining_finance, public
AS $$
DECLARE
    equip RECORD;
    depreciacao_valor DECIMAL(15,2);
    mes_inicio DATE;
    vencimento DATE;
BEGIN
    mes_inicio := DATE_TRUNC('month', CURRENT_DATE)::DATE;
    vencimento := mes_inicio + INTERVAL '5 days';

    FOR equip IN
        SELECT id, nome, valor_aquisicao, valor_residual, vida_util_anos
        FROM mining_finance.equipamentos
        WHERE status = 'operacional'
          AND valor_aquisicao IS NOT NULL
          AND vida_util_anos IS NOT NULL
          AND (vida_util_anos * 12) > 0
    LOOP
        depreciacao_valor := (COALESCE(equip.valor_aquisicao, 0) - COALESCE(equip.valor_residual, 0))
            / NULLIF(equip.vida_util_anos * 12, 0);

        IF depreciacao_valor IS NOT NULL AND depreciacao_valor > 0 THEN
            INSERT INTO mining_finance.contas_pagar (
                projeto_id,
                categoria,
                descricao,
                valor_bruto,
                data_emissao,
                data_vencimento,
                status
            ) VALUES (
                NULL,  -- equipamentos sem projeto_id no schema atual; ajustar se adicionar vínculo
                'depreciacao',
                'Depreciação - ' || equip.nome,
                depreciacao_valor,
                mes_inicio,
                vencimento,
                'pendente'
            );
        END IF;
    END LOOP;
END;
$$;

-- Agendar execução mensal via pg_cron (apenas se a extensão existir)
-- Supabase: em alguns planos pg_cron está em extensões; habilitar se necessário.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        PERFORM cron.schedule(
            'depreciacao-mensal',
            '0 2 1 * *',  -- Todo dia 1 às 02:00
            'SELECT mining_finance.calcular_depreciacao_mensal();'
        );
    END IF;
EXCEPTION
    WHEN undefined_object OR undefined_function THEN
        NULL;  -- pg_cron não disponível; agendar via Supabase Edge Function + Cron ou outro scheduler
END;
$$;
