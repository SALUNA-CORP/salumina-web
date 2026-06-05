-- ================================================
-- POLYBET POOLS - EJECUTA ESTE ARCHIVO COMPLETO
-- Copia TODO y pégalo en Supabase SQL Editor
-- ================================================

-- Verificar que user_profiles existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'user_profiles'
  ) THEN
    RAISE EXCEPTION 'ERROR: La tabla user_profiles no existe. Verifica tu base de datos.';
  END IF;

  RAISE NOTICE '✓ Tabla user_profiles encontrada';
END $$;

-- ============================================
-- 1. CREAR TIPOS ENUM
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
    CREATE TYPE transaction_type AS ENUM (
      'deposit',
      'withdrawal',
      'bet_placed',
      'bet_won',
      'bet_refund',
      'commission_earned',
      'commission_paid'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_status') THEN
    CREATE TYPE transaction_status AS ENUM (
      'pending',
      'completed',
      'failed',
      'cancelled'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
    CREATE TYPE payment_method AS ENUM (
      'stripe',
      'pse',
      'bold',
      'wompi'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'market_category') THEN
    CREATE TYPE market_category AS ENUM (
      'sports_soccer',
      'sports_basketball',
      'sports_tennis',
      'sports_other',
      'politics',
      'entertainment',
      'prediction'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'market_status') THEN
    CREATE TYPE market_status AS ENUM (
      'draft',
      'open',
      'locked',
      'resolving',
      'resolved',
      'cancelled'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bet_status') THEN
    CREATE TYPE bet_status AS ENUM (
      'active',
      'won',
      'lost',
      'refunded'
    );
  END IF;

  RAISE NOTICE '✓ Tipos ENUM creados';
END $$;

-- ============================================
-- 2. CREAR TABLAS
-- ============================================

-- User Wallets
CREATE TABLE IF NOT EXISTS user_wallets (
  user_id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  total_deposited DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  total_withdrawn DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  total_wagered DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  total_won DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT balance_non_negative CHECK (balance >= 0)
);

-- Wallet Transactions
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  balance_before DECIMAL(10, 2) NOT NULL,
  balance_after DECIMAL(10, 2) NOT NULL,
  status transaction_status NOT NULL DEFAULT 'pending',
  payment_method payment_method,
  payment_id VARCHAR(255),
  payment_metadata JSONB,
  description TEXT,
  reference_id INT,
  reference_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Markets
CREATE TABLE IF NOT EXISTS markets (
  id SERIAL PRIMARY KEY,
  category market_category NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  options JSONB NOT NULL,
  opens_at TIMESTAMP WITH TIME ZONE NOT NULL,
  closes_at TIMESTAMP WITH TIME ZONE NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status market_status NOT NULL DEFAULT 'draft',
  winning_option INT,
  resolution_source TEXT,
  resolved_by UUID REFERENCES user_profiles(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  image_url TEXT,
  external_id VARCHAR(255),
  metadata JSONB,
  min_bet DECIMAL(10, 2) NOT NULL DEFAULT 1.00,
  max_bet DECIMAL(10, 2) NOT NULL DEFAULT 100.00,
  max_total_bet DECIMAL(10, 2) NOT NULL DEFAULT 500.00,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bets
CREATE TABLE IF NOT EXISTS bets (
  id SERIAL PRIMARY KEY,
  market_id INT NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  option_index INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  is_premium BOOLEAN NOT NULL DEFAULT FALSE,
  commission_rate DECIMAL(5, 4) NOT NULL,
  status bet_status NOT NULL DEFAULT 'active',
  payout DECIMAL(10, 2),
  commission_charged DECIMAL(10, 2),
  net_payout DECIMAL(10, 2),
  estimated_odds DECIMAL(10, 4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Pool Stats
CREATE TABLE IF NOT EXISTS pool_stats (
  market_id INT NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  option_index INT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  total_bets INT NOT NULL DEFAULT 0,
  premium_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  premium_bets INT NOT NULL DEFAULT 0,
  free_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  free_bets INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (market_id, option_index)
);

DO $$ BEGIN RAISE NOTICE '✓ Tablas creadas'; END $$;

-- ============================================
-- 3. CREAR ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_status ON wallet_transactions(status);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created ON wallet_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_markets_status ON markets(status);
CREATE INDEX IF NOT EXISTS idx_markets_category ON markets(category);
CREATE INDEX IF NOT EXISTS idx_markets_closes_at ON markets(closes_at);
CREATE INDEX IF NOT EXISTS idx_markets_event_date ON markets(event_date);

CREATE INDEX IF NOT EXISTS idx_bets_market ON bets(market_id);
CREATE INDEX IF NOT EXISTS idx_bets_user ON bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_status ON bets(status);
CREATE INDEX IF NOT EXISTS idx_bets_created ON bets(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pool_stats_market ON pool_stats(market_id);

DO $$ BEGIN RAISE NOTICE '✓ Índices creados'; END $$;

-- ============================================
-- 4. TRIGGERS Y FUNCIONES
-- ============================================

-- Trigger: Auto-crear wallet
CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_wallets (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_wallet ON user_profiles;
CREATE TRIGGER trigger_create_wallet
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_user_wallet();

-- Trigger: Actualizar wallet timestamp
CREATE OR REPLACE FUNCTION update_wallet_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_wallet_timestamp ON user_wallets;
CREATE TRIGGER trigger_update_wallet_timestamp
  BEFORE UPDATE ON user_wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_wallet_timestamp();

-- Trigger: Actualizar market timestamp
CREATE OR REPLACE FUNCTION update_market_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_market_timestamp ON markets;
CREATE TRIGGER trigger_update_market_timestamp
  BEFORE UPDATE ON markets
  FOR EACH ROW
  EXECUTE FUNCTION update_market_timestamp();

-- Trigger: Actualizar pool stats
CREATE OR REPLACE FUNCTION update_pool_stats_on_bet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO pool_stats (market_id, option_index, total_amount, total_bets, premium_amount, premium_bets, free_amount, free_bets)
  VALUES (
    NEW.market_id,
    NEW.option_index,
    NEW.amount,
    1,
    CASE WHEN NEW.is_premium THEN NEW.amount ELSE 0 END,
    CASE WHEN NEW.is_premium THEN 1 ELSE 0 END,
    CASE WHEN NOT NEW.is_premium THEN NEW.amount ELSE 0 END,
    CASE WHEN NOT NEW.is_premium THEN 1 ELSE 0 END
  )
  ON CONFLICT (market_id, option_index)
  DO UPDATE SET
    total_amount = pool_stats.total_amount + NEW.amount,
    total_bets = pool_stats.total_bets + 1,
    premium_amount = pool_stats.premium_amount + CASE WHEN NEW.is_premium THEN NEW.amount ELSE 0 END,
    premium_bets = pool_stats.premium_bets + CASE WHEN NEW.is_premium THEN 1 ELSE 0 END,
    free_amount = pool_stats.free_amount + CASE WHEN NOT NEW.is_premium THEN NEW.amount ELSE 0 END,
    free_bets = pool_stats.free_bets + CASE WHEN NOT NEW.is_premium THEN 1 ELSE 0 END,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_pool_stats ON bets;
CREATE TRIGGER trigger_update_pool_stats
  AFTER INSERT ON bets
  FOR EACH ROW
  EXECUTE FUNCTION update_pool_stats_on_bet();

DO $$ BEGIN RAISE NOTICE '✓ Triggers creados'; END $$;

-- ============================================
-- 5. CREAR WALLETS PARA USUARIOS EXISTENTES
-- ============================================

INSERT INTO user_wallets (user_id, balance)
SELECT id, 0.00
FROM user_profiles
WHERE id NOT IN (SELECT user_id FROM user_wallets)
ON CONFLICT (user_id) DO NOTHING;

DO $$ BEGIN RAISE NOTICE '✓ Wallets creados para usuarios existentes'; END $$;

-- ============================================
-- 6. RLS POLICIES
-- ============================================

ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_stats ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS wallet_select_own ON user_wallets;
DROP POLICY IF EXISTS transactions_select_own ON wallet_transactions;
DROP POLICY IF EXISTS markets_select_public ON markets;
DROP POLICY IF EXISTS bets_select_own ON bets;
DROP POLICY IF EXISTS pool_stats_select_public ON pool_stats;
DROP POLICY IF EXISTS markets_admin_all ON markets;
DROP POLICY IF EXISTS bets_admin_select ON bets;
DROP POLICY IF EXISTS wallets_admin_select ON user_wallets;
DROP POLICY IF EXISTS transactions_admin_select ON wallet_transactions;

-- Create policies
CREATE POLICY wallet_select_own ON user_wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY transactions_select_own ON wallet_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY markets_select_public ON markets
  FOR SELECT USING (status IN ('open', 'locked', 'resolved'));

CREATE POLICY bets_select_own ON bets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY pool_stats_select_public ON pool_stats
  FOR SELECT USING (true);

CREATE POLICY markets_admin_all ON markets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY bets_admin_select ON bets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY wallets_admin_select ON user_wallets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY transactions_admin_select ON wallet_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

DO $$ BEGIN RAISE NOTICE '✓ RLS Policies creadas'; END $$;

-- ============================================
-- 7. VISTAS
-- ============================================

CREATE OR REPLACE VIEW market_summary AS
SELECT
  m.id,
  m.category,
  m.title,
  m.description,
  m.options,
  m.status,
  m.opens_at,
  m.closes_at,
  m.event_date,
  m.winning_option,
  COALESCE(SUM(ps.total_amount), 0) as total_pool,
  COALESCE(SUM(ps.total_bets), 0) as total_bets,
  m.created_at
FROM markets m
LEFT JOIN pool_stats ps ON m.id = ps.market_id
GROUP BY m.id;

CREATE OR REPLACE VIEW user_bet_history AS
SELECT
  b.id as bet_id,
  b.user_id,
  b.amount,
  b.status as bet_status,
  b.payout,
  b.net_payout,
  b.is_premium,
  b.commission_rate,
  b.created_at as bet_placed_at,
  m.id as market_id,
  m.title as market_title,
  m.category,
  m.options,
  b.option_index,
  m.status as market_status,
  m.event_date
FROM bets b
JOIN markets m ON b.market_id = m.id;

DO $$ BEGIN RAISE NOTICE '✓ Vistas creadas'; END $$;

-- ============================================
-- FINALIZACIÓN
-- ============================================

DO $$
DECLARE
  wallet_count INT;
BEGIN
  SELECT COUNT(*) INTO wallet_count FROM user_wallets;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✓✓✓ MIGRACIÓN COMPLETADA EXITOSAMENTE';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tablas creadas: 5';
  RAISE NOTICE 'Wallets creados: %', wallet_count;
  RAISE NOTICE 'Triggers: 4';
  RAISE NOTICE 'Vistas: 2';
  RAISE NOTICE '';
  RAISE NOTICE 'Siguiente paso: Ejecutar mercados de muestra';
  RAISE NOTICE '========================================';
END $$;
