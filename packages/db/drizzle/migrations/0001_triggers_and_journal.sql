-- ============================================================
-- Migration 0001: Triggers and Journal View
-- ============================================================

--> statement-breakpoint
-- Function: calculate signed amount per transaction
CREATE OR REPLACE FUNCTION calculate_signed_amount(p_transaction_id UUID)
RETURNS NUMERIC(14, 2) AS $$
DECLARE
    v_amount NUMERIC(14, 2);
    v_type TEXT;
    v_user_id UUID;
BEGIN
    SELECT amount, type, user_id INTO v_amount, v_type, v_user_id
    FROM transactions WHERE id = p_transaction_id;

    IF v_type = 'expense' THEN
        v_amount := -v_amount;
    ELSIF v_type = 'transfer' THEN
        IF v_user_id = (SELECT from_account_id FROM transactions WHERE id = p_transaction_id) THEN
            v_amount := -v_amount;
        END IF;
    END IF;

    RETURN v_amount;
END;
$$ LANGUAGE plpgsql;

--> statement-breakpoint
-- Function: calculate running balance for a user
CREATE OR REPLACE FUNCTION calculate_running_balance(p_user_id UUID)
RETURNS NUMERIC(14, 2) AS $$
DECLARE
    v_balance NUMERIC(14, 2) := 0;
BEGIN
    SELECT COALESCE(SUM(calculate_signed_amount(t.id)), 0) INTO v_balance
    FROM transactions t
    WHERE t.user_id = p_user_id AND t.is_archived = false;

    RETURN v_balance;
END;
$$ LANGUAGE plpgsql;

--> statement-breakpoint
-- Function: update journal balance
CREATE OR REPLACE FUNCTION update_journal_balance_func()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE journal
    SET balance = calculate_running_balance(journal.user_id)
    WHERE journal.id = COALESCE(NEW.id, OLD.id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

--> statement-breakpoint
-- Trigger: update journal balance after insert, update or delete
CREATE OR REPLACE TRIGGER update_journal_balance
    AFTER INSERT OR UPDATE OR DELETE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_journal_balance_func();

--> statement-breakpoint
-- ============================================================
-- View: journal (depends on triggers above)
-- ============================================================
CREATE OR REPLACE VIEW journal AS
SELECT
    t.id AS id,
    t.user_id AS user_id,
    t.date AS date,
    t.created_at AS created_at,
    t.description AS description,
    c.name AS category_name,
    a.id AS account_id,
    a.name AS account_name,
    t.type AS type,
    calculate_signed_amount(t.id) AS signed_amount,
    calculate_running_balance(t.user_id) AS balance,
    t.id AS transaction_id
FROM transactions t
LEFT JOIN accounts a
    ON t.account_id = a.id
    OR (t.type = 'transfer' AND t.to_account_id = a.id)
LEFT JOIN categories c ON t.category_id = c.id;
