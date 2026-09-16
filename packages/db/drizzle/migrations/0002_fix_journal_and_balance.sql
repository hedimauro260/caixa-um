-- ============================================================
-- Migration 0002: Fix Journal View and Account Balance Trigger
-- ============================================================
-- Corrige problemas da 0001:
--   * triggers set_signed_amount / unset_signed_amount eram no-ops
--   * update_journal_balance tentava UPDATE em uma VIEW (erro em runtime)
--   * view journal: 1 linha/transação, saldo global por usuário,
--     signed_amount de transfer sempre positivo
--   * accounts.balance nunca era atualizado por trigger
--
-- Nova semântica:
--   * accounts.balance mantido por trigger (arquivadas excluídas)
--   * view journal: 1 entry por conta em transfer ('{uuid}-out' / '{uuid}-in'),
--     saldo acumulado POR CONTA (window sobre user_id, account_id)
--   * IDs de entry text (únicos para deep linking)

--> statement-breakpoint
-- Remover triggers quebrados da 0001
DROP TRIGGER IF EXISTS set_signed_amount ON transactions;
--> statement-breakpoint
DROP TRIGGER IF EXISTS unset_signed_amount ON transactions;
--> statement-breakpoint
DROP TRIGGER IF EXISTS update_journal_balance ON transactions;
--> statement-breakpoint
-- A view journal da 0001 depende das funções antigas; dropa antes
DROP VIEW IF EXISTS journal CASCADE;
--> statement-breakpoint
DROP FUNCTION IF EXISTS calculate_signed_amount(UUID);
--> statement-breakpoint
DROP FUNCTION IF EXISTS calculate_running_balance(UUID);
--> statement-breakpoint
DROP FUNCTION IF EXISTS update_journal_balance_func();
--> statement-breakpoint
-- Função de manutenção do saldo das contas
-- (arquivada sai do saldo — consistente com a view e o summary)
CREATE OR REPLACE FUNCTION update_account_balance_func()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Reverte o efeito do OLD (DELETE e UPDATE)
  IF TG_OP IN ('UPDATE', 'DELETE') AND NOT OLD.is_archived THEN
    IF OLD.type = 'income' THEN
      UPDATE accounts SET balance = balance - OLD.amount WHERE id = OLD.account_id;
    ELSIF OLD.type = 'expense' THEN
      UPDATE accounts SET balance = balance + OLD.amount WHERE id = OLD.account_id;
    ELSIF OLD.type = 'transfer' THEN
      UPDATE accounts SET balance = balance + OLD.amount WHERE id = OLD.from_account_id;
      UPDATE accounts SET balance = balance - OLD.amount WHERE id = OLD.to_account_id;
    END IF;
  END IF;

  -- Aplica o efeito do NEW (INSERT e UPDATE)
  IF TG_OP IN ('INSERT', 'UPDATE') AND NOT NEW.is_archived THEN
    IF NEW.type = 'income' THEN
      UPDATE accounts SET balance = balance + NEW.amount WHERE id = NEW.account_id;
    ELSIF NEW.type = 'expense' THEN
      UPDATE accounts SET balance = balance - NEW.amount WHERE id = NEW.account_id;
    ELSIF NEW.type = 'transfer' THEN
      UPDATE accounts SET balance = balance - NEW.amount WHERE id = NEW.from_account_id;
      UPDATE accounts SET balance = balance + NEW.amount WHERE id = NEW.to_account_id;
    END IF;
  END IF;

  RETURN NULL;
END;
$$;
--> statement-breakpoint
DROP TRIGGER IF EXISTS trg_account_balance ON transactions;
--> statement-breakpoint
CREATE TRIGGER trg_account_balance
  AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_account_balance_func();
--> statement-breakpoint
-- View journal: 1 entry por conta (transfer gera 2)
CREATE OR REPLACE VIEW journal AS
WITH entries AS (
  -- income / expense: 1 entry
  SELECT
    t.id::text AS id,
    t.user_id,
    t.date,
    t.created_at,
    t.description,
    c.name AS category_name,
    a.id AS account_id,
    a.name AS account_name,
    t.type,
    CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END AS signed_amount,
    t.id AS transaction_id
  FROM transactions t
  LEFT JOIN accounts a ON a.id = t.account_id
  LEFT JOIN categories c ON c.id = t.category_id
  WHERE t.is_archived = false AND t.type IN ('income', 'expense')

  UNION ALL

  -- transfer: entry de ORIGEM (sai dinheiro)
  SELECT
    t.id::text || '-out' AS id,
    t.user_id,
    t.date,
    t.created_at,
    t.description,
    NULL AS category_name,
    a_from.id AS account_id,
    a_from.name AS account_name,
    t.type,
    -t.amount AS signed_amount,
    t.id AS transaction_id
  FROM transactions t
  LEFT JOIN accounts a_from ON a_from.id = t.from_account_id
  WHERE t.is_archived = false AND t.type = 'transfer'

  UNION ALL

  -- transfer: entry de DESTINO (entra dinheiro)
  SELECT
    t.id::text || '-in' AS id,
    t.user_id,
    t.date,
    t.created_at,
    t.description,
    NULL AS category_name,
    a_to.id AS account_id,
    a_to.name AS account_name,
    t.type,
    t.amount AS signed_amount,
    t.id AS transaction_id
  FROM transactions t
  LEFT JOIN accounts a_to ON a_to.id = t.to_account_id
  WHERE t.is_archived = false AND t.type = 'transfer'
)
SELECT
  e.id,
  e.user_id,
  e.date,
  e.created_at,
  e.description,
  e.category_name,
  e.account_id,
  e.account_name,
  e.type,
  e.signed_amount,
  SUM(e.signed_amount) OVER (
    PARTITION BY e.user_id, e.account_id
    ORDER BY e.date, e.created_at, e.id
  ) AS balance,
  e.transaction_id
FROM entries e;
--> statement-breakpoint
-- Healing: recalcula accounts.balance a partir das transações
-- não arquivadas (corrige saldos zerados/errados existentes)
UPDATE accounts a
SET balance = COALESCE(
  (
    SELECT SUM(s.signed_amount)
    FROM (
      SELECT
        CASE WHEN t.type = 'income' THEN t.amount ELSE -t.amount END AS signed_amount,
        t.account_id AS account_id
      FROM transactions t
      WHERE t.is_archived = false AND t.type IN ('income', 'expense')

      UNION ALL

      SELECT -t.amount AS signed_amount, t.from_account_id AS account_id
      FROM transactions t
      WHERE t.is_archived = false AND t.type = 'transfer'

      UNION ALL

      SELECT t.amount AS signed_amount, t.to_account_id AS account_id
      FROM transactions t
      WHERE t.is_archived = false AND t.type = 'transfer'
    ) s
    WHERE s.account_id = a.id
  ),
  0
);