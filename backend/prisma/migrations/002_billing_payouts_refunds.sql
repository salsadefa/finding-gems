-- ============================================
-- Finding Gems Database Schema
-- Migration: Billing, Payouts & Refunds System
-- Run this in Supabase SQL Editor AFTER init.sql
-- ============================================

-- ============================================
-- BILLING ENUMS
-- ============================================

DO $$ BEGIN
  CREATE TYPE "OrderStatus" AS ENUM ('pending', 'paid', 'failed', 'refunded', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "TransactionStatus" AS ENUM ('pending', 'processing', 'success', 'failed', 'expired', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "InvoiceStatus" AS ENUM ('draft', 'issued', 'paid', 'void', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "PayoutStatus" AS ENUM ('pending', 'processing', 'completed', 'rejected', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "RefundStatus" AS ENUM ('requested', 'under_review', 'approved', 'rejected', 'processing', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- PRICING TIERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS "pricing_tiers" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "website_id" TEXT NOT NULL REFERENCES "websites"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(15,2) NOT NULL,
    "currency" TEXT DEFAULT 'IDR',
    "duration_days" INTEGER,
    "features" TEXT[],
    "is_popular" BOOLEAN DEFAULT false,
    "is_active" BOOLEAN DEFAULT true,
    "sort_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_pricing_tiers_website_id" ON "pricing_tiers"("website_id");
CREATE INDEX IF NOT EXISTS "idx_pricing_tiers_is_active" ON "pricing_tiers"("is_active");

-- ============================================
-- ORDERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS "orders" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "order_number" TEXT UNIQUE NOT NULL,
    "buyer_id" TEXT NOT NULL REFERENCES "users"("id"),
    "website_id" TEXT NOT NULL REFERENCES "websites"("id"),
    "tier_id" TEXT REFERENCES "pricing_tiers"("id"),
    "creator_id" TEXT NOT NULL REFERENCES "users"("id"),
    "subtotal" DECIMAL(15,2) NOT NULL,
    "discount_amount" DECIMAL(15,2) DEFAULT 0,
    "platform_fee" DECIMAL(15,2) DEFAULT 0,
    "total_amount" DECIMAL(15,2) NOT NULL,
    "currency" TEXT DEFAULT 'IDR',
    "status" "OrderStatus" DEFAULT 'pending',
    "payment_method" TEXT,
    "refund_status" TEXT DEFAULT 'none',
    "notes" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMP WITH TIME ZONE,
    "expired_at" TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS "idx_orders_order_number" ON "orders"("order_number");
CREATE INDEX IF NOT EXISTS "idx_orders_buyer_id" ON "orders"("buyer_id");
CREATE INDEX IF NOT EXISTS "idx_orders_creator_id" ON "orders"("creator_id");
CREATE INDEX IF NOT EXISTS "idx_orders_website_id" ON "orders"("website_id");
CREATE INDEX IF NOT EXISTS "idx_orders_status" ON "orders"("status");
CREATE INDEX IF NOT EXISTS "idx_orders_created_at" ON "orders"("created_at");

-- ============================================
-- TRANSACTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS "transactions" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "order_id" TEXT NOT NULL REFERENCES "orders"("id"),
    "gateway" TEXT NOT NULL,
    "gateway_transaction_id" TEXT,
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" TEXT DEFAULT 'IDR',
    "status" "TransactionStatus" DEFAULT 'pending',
    "payment_method" TEXT,
    "payment_url" TEXT,
    "expired_at" TIMESTAMP WITH TIME ZONE,
    "paid_at" TIMESTAMP WITH TIME ZONE,
    "metadata" JSONB,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_transactions_order_id" ON "transactions"("order_id");
CREATE INDEX IF NOT EXISTS "idx_transactions_gateway_transaction_id" ON "transactions"("gateway_transaction_id");
CREATE INDEX IF NOT EXISTS "idx_transactions_status" ON "transactions"("status");

-- ============================================
-- INVOICES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS "invoices" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "invoice_number" TEXT UNIQUE NOT NULL,
    "order_id" TEXT NOT NULL REFERENCES "orders"("id"),
    "buyer_id" TEXT NOT NULL REFERENCES "users"("id"),
    "seller_id" TEXT NOT NULL REFERENCES "users"("id"),
    "subtotal" DECIMAL(15,2) NOT NULL,
    "discount_amount" DECIMAL(15,2) DEFAULT 0,
    "platform_fee" DECIMAL(15,2) DEFAULT 0,
    "total_amount" DECIMAL(15,2) NOT NULL,
    "currency" TEXT DEFAULT 'IDR',
    "status" "InvoiceStatus" DEFAULT 'draft',
    "line_items" JSONB NOT NULL,
    "billing_info" JSONB,
    "notes" TEXT,
    "issued_at" TIMESTAMP WITH TIME ZONE,
    "paid_at" TIMESTAMP WITH TIME ZONE,
    "due_date" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_invoices_invoice_number" ON "invoices"("invoice_number");
CREATE INDEX IF NOT EXISTS "idx_invoices_order_id" ON "invoices"("order_id");
CREATE INDEX IF NOT EXISTS "idx_invoices_buyer_id" ON "invoices"("buyer_id");
CREATE INDEX IF NOT EXISTS "idx_invoices_seller_id" ON "invoices"("seller_id");
CREATE INDEX IF NOT EXISTS "idx_invoices_status" ON "invoices"("status");

-- ============================================
-- USER ACCESS TABLE (Purchased Access)
-- ============================================

CREATE TABLE IF NOT EXISTS "user_access" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "user_id" TEXT NOT NULL REFERENCES "users"("id"),
    "website_id" TEXT NOT NULL REFERENCES "websites"("id"),
    "tier_id" TEXT REFERENCES "pricing_tiers"("id"),
    "order_id" TEXT NOT NULL REFERENCES "orders"("id"),
    "granted_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP WITH TIME ZONE,
    "status" TEXT DEFAULT 'active',
    "revoked_at" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("user_id", "website_id", "tier_id")
);

CREATE INDEX IF NOT EXISTS "idx_user_access_user_id" ON "user_access"("user_id");
CREATE INDEX IF NOT EXISTS "idx_user_access_website_id" ON "user_access"("website_id");
CREATE INDEX IF NOT EXISTS "idx_user_access_status" ON "user_access"("status");

-- ============================================
-- CREATOR BALANCES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS "creator_balances" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "creator_id" TEXT UNIQUE NOT NULL REFERENCES "users"("id"),
    "total_earnings" DECIMAL(15,2) DEFAULT 0,
    "pending_balance" DECIMAL(15,2) DEFAULT 0,
    "available_balance" DECIMAL(15,2) DEFAULT 0,
    "withdrawn_balance" DECIMAL(15,2) DEFAULT 0,
    "currency" TEXT DEFAULT 'IDR',
    "last_calculated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_creator_balances_creator_id" ON "creator_balances"("creator_id");

-- ============================================
-- CREATOR BANK ACCOUNTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS "creator_bank_accounts" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "creator_id" TEXT NOT NULL REFERENCES "users"("id"),
    "bank_name" TEXT NOT NULL,
    "bank_code" TEXT,
    "account_number" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "is_primary" BOOLEAN DEFAULT false,
    "is_verified" BOOLEAN DEFAULT false,
    "verified_at" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_creator_bank_accounts_creator_id" ON "creator_bank_accounts"("creator_id");
CREATE INDEX IF NOT EXISTS "idx_creator_bank_accounts_is_primary" ON "creator_bank_accounts"("is_primary");

-- ============================================
-- PAYOUTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS "payouts" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "payout_number" TEXT UNIQUE NOT NULL,
    "creator_id" TEXT NOT NULL REFERENCES "users"("id"),
    "amount" DECIMAL(15,2) NOT NULL,
    "fee" DECIMAL(15,2) DEFAULT 0,
    "net_amount" DECIMAL(15,2) NOT NULL,
    "currency" TEXT DEFAULT 'IDR',
    "bank_name" TEXT NOT NULL,
    "bank_account_number" TEXT NOT NULL,
    "bank_account_name" TEXT NOT NULL,
    "status" "PayoutStatus" DEFAULT 'pending',
    "status_message" TEXT,
    "transfer_reference" TEXT,
    "transfer_proof_url" TEXT,
    "processed_by" TEXT REFERENCES "users"("id"),
    "processed_at" TIMESTAMP WITH TIME ZONE,
    "notes" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_payouts_payout_number" ON "payouts"("payout_number");
CREATE INDEX IF NOT EXISTS "idx_payouts_creator_id" ON "payouts"("creator_id");
CREATE INDEX IF NOT EXISTS "idx_payouts_status" ON "payouts"("status");
CREATE INDEX IF NOT EXISTS "idx_payouts_created_at" ON "payouts"("created_at");

-- ============================================
-- REFUNDS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS "refunds" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "refund_number" TEXT UNIQUE NOT NULL,
    "order_id" TEXT NOT NULL REFERENCES "orders"("id"),
    "transaction_id" TEXT REFERENCES "transactions"("id"),
    "requested_by" TEXT NOT NULL REFERENCES "users"("id"),
    "requester_type" TEXT DEFAULT 'buyer',
    "original_amount" DECIMAL(15,2) NOT NULL,
    "refund_amount" DECIMAL(15,2) NOT NULL,
    "currency" TEXT DEFAULT 'IDR',
    "reason" TEXT NOT NULL,
    "reason_category" TEXT,
    "evidence_urls" TEXT[],
    "status" "RefundStatus" DEFAULT 'requested',
    "status_message" TEXT,
    "reviewed_by" TEXT REFERENCES "users"("id"),
    "reviewed_at" TIMESTAMP WITH TIME ZONE,
    "processed_by" TEXT REFERENCES "users"("id"),
    "processed_at" TIMESTAMP WITH TIME ZONE,
    "refund_method" TEXT,
    "refund_details" JSONB,
    "notes" TEXT,
    "admin_notes" TEXT,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_refunds_refund_number" ON "refunds"("refund_number");
CREATE INDEX IF NOT EXISTS "idx_refunds_order_id" ON "refunds"("order_id");
CREATE INDEX IF NOT EXISTS "idx_refunds_requested_by" ON "refunds"("requested_by");
CREATE INDEX IF NOT EXISTS "idx_refunds_status" ON "refunds"("status");
CREATE INDEX IF NOT EXISTS "idx_refunds_created_at" ON "refunds"("created_at");

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to generate payout number
CREATE OR REPLACE FUNCTION generate_payout_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  year_month TEXT;
  seq_num INTEGER;
BEGIN
  year_month := TO_CHAR(NOW(), 'YYMM');
  
  -- Get next sequence number for this month
  SELECT COALESCE(MAX(
    CASE 
      WHEN payout_number ~ ('^PO-' || year_month || '-[0-9]+$') 
      THEN SUBSTRING(payout_number FROM '[0-9]+$')::INTEGER 
      ELSE 0 
    END
  ), 0) + 1
  INTO seq_num
  FROM payouts
  WHERE payout_number LIKE 'PO-' || year_month || '-%';
  
  new_number := 'PO-' || year_month || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function to generate refund number
CREATE OR REPLACE FUNCTION generate_refund_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  year_month TEXT;
  seq_num INTEGER;
BEGIN
  year_month := TO_CHAR(NOW(), 'YYMM');
  
  -- Get next sequence number for this month
  SELECT COALESCE(MAX(
    CASE 
      WHEN refund_number ~ ('^RF-' || year_month || '-[0-9]+$') 
      THEN SUBSTRING(refund_number FROM '[0-9]+$')::INTEGER 
      ELSE 0 
    END
  ), 0) + 1
  INTO seq_num
  FROM refunds
  WHERE refund_number LIKE 'RF-' || year_month || '-%';
  
  new_number := 'RF-' || year_month || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function to recalculate creator balance
CREATE OR REPLACE FUNCTION recalculate_creator_balance(p_creator_id TEXT)
RETURNS creator_balances AS $$
DECLARE
  v_total_earnings DECIMAL(15,2);
  v_pending_balance DECIMAL(15,2);
  v_withdrawn_balance DECIMAL(15,2);
  v_available_balance DECIMAL(15,2);
  v_result creator_balances;
BEGIN
  -- Total earnings from paid orders (after platform fee)
  SELECT COALESCE(SUM(total_amount - COALESCE(platform_fee, 0)), 0)
  INTO v_total_earnings
  FROM orders
  WHERE creator_id = p_creator_id
    AND status = 'paid'
    AND refund_status = 'none';
  
  -- Pending balance (orders paid in last 7 days - holding period)
  SELECT COALESCE(SUM(total_amount - COALESCE(platform_fee, 0)), 0)
  INTO v_pending_balance
  FROM orders
  WHERE creator_id = p_creator_id
    AND status = 'paid'
    AND refund_status = 'none'
    AND paid_at > NOW() - INTERVAL '7 days';
  
  -- Total withdrawn
  SELECT COALESCE(SUM(net_amount), 0)
  INTO v_withdrawn_balance
  FROM payouts
  WHERE creator_id = p_creator_id
    AND status = 'completed';
  
  -- Available = Total - Pending - Withdrawn
  v_available_balance := v_total_earnings - v_pending_balance - v_withdrawn_balance;
  
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

-- Trigger to update creator balance after order status change
CREATE OR REPLACE FUNCTION trigger_update_creator_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid' OR OLD.status = 'paid' THEN
    PERFORM recalculate_creator_balance(NEW.creator_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_creator_balance ON orders;
CREATE TRIGGER trg_update_creator_balance
AFTER INSERT OR UPDATE OF status ON orders
FOR EACH ROW
EXECUTE FUNCTION trigger_update_creator_balance();

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

-- Pricing Tiers: Public read, creator write
CREATE POLICY "pricing_tiers_public_read" ON pricing_tiers
  FOR SELECT USING (is_active = true);

CREATE POLICY "pricing_tiers_creator_all" ON pricing_tiers
  FOR ALL USING (
    auth.uid()::TEXT = (SELECT "creatorId" FROM websites WHERE id = website_id)
  );

-- Orders: Buyer and Creator can view their orders
CREATE POLICY "orders_buyer_select" ON orders
  FOR SELECT USING (auth.uid()::TEXT = buyer_id);

CREATE POLICY "orders_creator_select" ON orders
  FOR SELECT USING (auth.uid()::TEXT = creator_id);

-- Transactions: View own order transactions
CREATE POLICY "transactions_user_select" ON transactions
  FOR SELECT USING (
    auth.uid()::TEXT IN (SELECT buyer_id FROM orders WHERE id = order_id)
    OR auth.uid()::TEXT IN (SELECT creator_id FROM orders WHERE id = order_id)
  );

-- Invoices: View own invoices
CREATE POLICY "invoices_buyer_select" ON invoices
  FOR SELECT USING (auth.uid()::TEXT = buyer_id);

CREATE POLICY "invoices_seller_select" ON invoices
  FOR SELECT USING (auth.uid()::TEXT = seller_id);

-- User Access: View own access
CREATE POLICY "user_access_user_select" ON user_access
  FOR SELECT USING (auth.uid()::TEXT = user_id);

-- Creator Balances: Creator can view own balance
CREATE POLICY "creator_balances_creator_select" ON creator_balances
  FOR SELECT USING (auth.uid()::TEXT = creator_id);

-- Bank Accounts: Creator can manage own accounts
CREATE POLICY "bank_accounts_creator_all" ON creator_bank_accounts
  FOR ALL USING (auth.uid()::TEXT = creator_id);

-- Payouts: Creator can view own payouts
CREATE POLICY "payouts_creator_select" ON payouts
  FOR SELECT USING (auth.uid()::TEXT = creator_id);

CREATE POLICY "payouts_creator_insert" ON payouts
  FOR INSERT WITH CHECK (auth.uid()::TEXT = creator_id);

-- Refunds: Requester can view own refunds
CREATE POLICY "refunds_requester_select" ON refunds
  FOR SELECT USING (auth.uid()::TEXT = requested_by);

CREATE POLICY "refunds_order_buyer_select" ON refunds
  FOR SELECT USING (
    auth.uid()::TEXT IN (SELECT buyer_id FROM orders WHERE id = order_id)
  );

-- ============================================
-- DONE!
-- ============================================
