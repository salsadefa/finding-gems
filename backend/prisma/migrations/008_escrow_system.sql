-- ============================================
-- Finding Gems Database Schema
-- Migration: Escrow / Payment Holding System (Phase 1 MVP)
-- Notes:
-- - Uses internal escrow state on orders + existing creator_balances.
-- - Backfills existing paid orders to preserve prior 7-day holding behavior.
-- ============================================

-- ============================================
-- ORDERS: ESCROW COLUMNS
-- ============================================

ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "escrow_status" TEXT NOT NULL DEFAULT 'held';
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "escrow_released_at" TIMESTAMP WITH TIME ZONE;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "escrow_release_reason" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "creator_payout_amount" DECIMAL(15,2) NOT NULL DEFAULT 0;

-- Optional but useful for reporting. Kept out for now to avoid double-fee ambiguity.
-- ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "platform_fee_amount" DECIMAL(15,2) NOT NULL DEFAULT 0;

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS "idx_orders_escrow_status" ON "orders"("escrow_status");
CREATE INDEX IF NOT EXISTS "idx_orders_escrow_auto_release" ON "orders"("status", "escrow_status", "paid_at");

-- ============================================
-- BACKFILL (KEEP EXISTING ECONOMICS)
-- ============================================

-- Backfill creator payout amount for existing paid orders.
UPDATE "orders"
SET "creator_payout_amount" = ROUND((COALESCE("total_amount", 0) - COALESCE("platform_fee", 0))::numeric, 2)
WHERE "status" = 'paid'
  AND COALESCE("refund_status", 'none') = 'none'
  AND COALESCE("creator_payout_amount", 0) = 0;

-- Preserve prior behavior: last 7 days = pending, older = available.
-- If order has no paid_at (legacy), fall back to created_at.
UPDATE "orders"
SET
  "escrow_status" = 'released',
  "escrow_released_at" = COALESCE("escrow_released_at", NOW()),
  "escrow_release_reason" = COALESCE("escrow_release_reason", 'auto_release_7days')
WHERE "status" = 'paid'
  AND COALESCE("refund_status", 'none') = 'none'
  AND "escrow_status" = 'held'
  AND COALESCE("paid_at", "created_at") <= NOW() - INTERVAL '7 days';

-- Mark refunded orders as refunded in escrow.
UPDATE "orders"
SET
  "escrow_status" = 'refunded',
  "escrow_released_at" = COALESCE("escrow_released_at", NOW()),
  "escrow_release_reason" = COALESCE("escrow_release_reason", 'refunded')
WHERE "status" = 'refunded'
   OR COALESCE("refund_status", 'none') IN ('full', 'partial');

-- ============================================
-- CREATOR BALANCE: ESCROW-AWARE CALCULATION
-- ============================================

CREATE OR REPLACE FUNCTION recalculate_creator_balance(p_creator_id TEXT)
RETURNS creator_balances AS $$
DECLARE
  v_total_earnings DECIMAL(15,2);
  v_pending_balance DECIMAL(15,2);
  v_released_gross DECIMAL(15,2);
  v_withdrawn_balance DECIMAL(15,2);
  v_available_balance DECIMAL(15,2);
  v_result creator_balances;
BEGIN
  -- Total earnings (held + released) from paid, non-refunded orders
  SELECT COALESCE(SUM(COALESCE(creator_payout_amount, total_amount - COALESCE(platform_fee, 0))), 0)
  INTO v_total_earnings
  FROM orders
  WHERE creator_id = p_creator_id
    AND status = 'paid'
    AND COALESCE(refund_status, 'none') = 'none'
    AND COALESCE(escrow_status, 'released') IN ('held', 'released');

  -- Pending balance = paid but still held
  SELECT COALESCE(SUM(COALESCE(creator_payout_amount, total_amount - COALESCE(platform_fee, 0))), 0)
  INTO v_pending_balance
  FROM orders
  WHERE creator_id = p_creator_id
    AND status = 'paid'
    AND COALESCE(refund_status, 'none') = 'none'
    AND COALESCE(escrow_status, 'released') = 'held';

  -- Released gross = paid and escrow released
  SELECT COALESCE(SUM(COALESCE(creator_payout_amount, total_amount - COALESCE(platform_fee, 0))), 0)
  INTO v_released_gross
  FROM orders
  WHERE creator_id = p_creator_id
    AND status = 'paid'
    AND COALESCE(refund_status, 'none') = 'none'
    AND COALESCE(escrow_status, 'released') = 'released';

  -- Total withdrawn
  SELECT COALESCE(SUM(net_amount), 0)
  INTO v_withdrawn_balance
  FROM payouts
  WHERE creator_id = p_creator_id
    AND status = 'completed';

  -- Available = Released - Withdrawn
  v_available_balance := v_released_gross - v_withdrawn_balance;

  -- Upsert balance record
  INSERT INTO creator_balances (
    creator_id,
    total_earnings,
    pending_balance,
    available_balance,
    withdrawn_balance,
    last_calculated_at,
    updated_at
  ) VALUES (
    p_creator_id,
    v_total_earnings,
    v_pending_balance,
    v_available_balance,
    v_withdrawn_balance,
    NOW(),
    NOW()
  )
  ON CONFLICT (creator_id) DO UPDATE SET
    total_earnings = EXCLUDED.total_earnings,
    pending_balance = EXCLUDED.pending_balance,
    available_balance = EXCLUDED.available_balance,
    withdrawn_balance = EXCLUDED.withdrawn_balance,
    last_calculated_at = NOW(),
    updated_at = NOW()
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update creator balance after order changes that affect payout
CREATE OR REPLACE FUNCTION trigger_update_creator_balance()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM recalculate_creator_balance(NEW.creator_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_creator_balance ON orders;
CREATE TRIGGER trg_update_creator_balance
AFTER INSERT OR UPDATE OF status, escrow_status, refund_status, creator_payout_amount, total_amount, platform_fee ON orders
FOR EACH ROW
EXECUTE FUNCTION trigger_update_creator_balance();
