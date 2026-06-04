-- ============================================================================
-- MIGRACIÓN 000: Crear tablas base del sistema MLM
-- Fecha: 2026-06-04
-- Descripción: Crea todas las tablas necesarias (solo si no existen)
-- ============================================================================

-- 1. CREAR TABLA subscriptions
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled')),
  currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'COP')),
  base_amount DECIMAL(10,2) DEFAULT 20.00,
  bookmaker_amount DECIMAL(10,2) DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL,
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  bold_subscription_id TEXT,
  crypto_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_period_end ON subscriptions(current_period_end);

-- 2. CREAR TABLA payments
-- ============================================================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'COP')),
  payment_method TEXT CHECK (payment_method IN ('stripe', 'bold', 'crypto')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  stripe_payment_intent_id TEXT,
  bold_transaction_id TEXT,
  crypto_tx_hash TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_subscription ON payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- 3. CREAR TABLA commissions
-- ============================================================================

CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('direct', 'binary')),
  level INTEGER,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'COP')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'available', 'withdrawn', 'applied')),
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  month_year TEXT,
  leg TEXT CHECK (leg IN ('left', 'right')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_commissions_user ON commissions(user_id);
CREATE INDEX IF NOT EXISTS idx_commissions_from_user ON commissions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);
CREATE INDEX IF NOT EXISTS idx_commissions_type ON commissions(type);
CREATE INDEX IF NOT EXISTS idx_commissions_month ON commissions(month_year);

-- 4. CREAR TABLA withdrawals
-- ============================================================================

CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'COP')),
  crypto TEXT CHECK (crypto IN ('USDT', 'USDC')),
  wallet_address TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'rejected')),
  approved_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejected_reason TEXT,
  tx_hash TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_created_at ON withdrawals(created_at DESC);

-- 5. CREAR TABLA commission_config
-- ============================================================================

CREATE TABLE IF NOT EXISTS commission_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  direct_commission_percentage DECIMAL(5,2) DEFAULT 10.00,
  min_withdrawal_usd DECIMAL(10,2) DEFAULT 50.00,
  min_withdrawal_cop DECIMAL(10,2) DEFAULT 150000.00,
  placement_change_days INTEGER DEFAULT 7,
  base_subscription_price DECIMAL(10,2) DEFAULT 20.00,
  bookmaker_price DECIMAL(10,2) DEFAULT 5.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar configuración por defecto si no existe
INSERT INTO commission_config (
  direct_commission_percentage,
  min_withdrawal_usd,
  min_withdrawal_cop,
  placement_change_days,
  base_subscription_price,
  bookmaker_price
)
SELECT 10.00, 50.00, 150000.00, 7, 20.00, 5.00
WHERE NOT EXISTS (SELECT 1 FROM commission_config);

-- 6. CREAR TABLA binary_commission_levels
-- ============================================================================

CREATE TABLE IF NOT EXISTS binary_commission_levels (
  level INTEGER PRIMARY KEY CHECK (level >= 2 AND level <= 20),
  percentage DECIMAL(5,2) DEFAULT 3.00 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar niveles 2-20 con porcentajes por defecto
INSERT INTO binary_commission_levels (level, percentage)
SELECT
  level,
  CASE
    WHEN level <= 5 THEN 5.00
    WHEN level <= 10 THEN 4.00
    WHEN level <= 15 THEN 3.00
    ELSE 2.00
  END as percentage
FROM generate_series(2, 20) as level
ON CONFLICT (level) DO NOTHING;

-- 7. CREAR TABLA subscription_bookmakers
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscription_bookmakers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  bookmaker_id INTEGER NOT NULL REFERENCES bookmakers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subscription_id, bookmaker_id)
);

CREATE INDEX IF NOT EXISTS idx_subscription_bookmakers_sub ON subscription_bookmakers(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_bookmakers_book ON subscription_bookmakers(bookmaker_id);

-- 8. CREAR TABLA binary_network (materialized view como tabla regular)
-- ============================================================================

CREATE TABLE IF NOT EXISTS binary_network (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  placement_parent_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  leg TEXT CHECK (leg IN ('left', 'right')),
  left_volume DECIMAL(10,2) DEFAULT 0,
  right_volume DECIMAL(10,2) DEFAULT 0,
  left_active_users INTEGER DEFAULT 0,
  right_active_users INTEGER DEFAULT 0,
  total_levels INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_binary_network_user ON binary_network(user_id);
CREATE INDEX IF NOT EXISTS idx_binary_network_parent ON binary_network(placement_parent_id);

-- 9. FUNCIÓN update_updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. TRIGGERS para updated_at
-- ============================================================================

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_commissions_updated_at ON commissions;
CREATE TRIGGER update_commissions_updated_at
  BEFORE UPDATE ON commissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_withdrawals_updated_at ON withdrawals;
CREATE TRIGGER update_withdrawals_updated_at
  BEFORE UPDATE ON withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_commission_config_updated_at ON commission_config;
CREATE TRIGGER update_commission_config_updated_at
  BEFORE UPDATE ON commission_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_binary_commission_levels_updated_at ON binary_commission_levels;
CREATE TRIGGER update_binary_commission_levels_updated_at
  BEFORE UPDATE ON binary_commission_levels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RESUMEN
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Tablas base creadas:';
  RAISE NOTICE '   - subscriptions';
  RAISE NOTICE '   - payments';
  RAISE NOTICE '   - commissions';
  RAISE NOTICE '   - withdrawals';
  RAISE NOTICE '   - commission_config (con valores por defecto)';
  RAISE NOTICE '   - binary_commission_levels (19 niveles configurados)';
  RAISE NOTICE '   - subscription_bookmakers';
  RAISE NOTICE '   - binary_network';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Siguiente: Ejecutar 001_add_mlm_fields.sql';
END $$;
