-- ================================================
-- POLYBET POOLS SYSTEM - Complete Parimutuel Betting
-- FIXED VERSION - Compatible with existing schema
-- ================================================

-- ============================================
-- 1. WALLET SYSTEM
-- ============================================

-- User wallets (balance tracking)
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

-- Transaction types: deposit, withdrawal, bet_placed, bet_won, bet_refund, commission
CREATE TYPE transaction_type AS ENUM (
  'deposit',
  'withdrawal',
  'bet_placed',
  'bet_won',
  'bet_refund',
  'commission_earned',
  'commission_paid'
);

-- Transaction status
CREATE TYPE transaction_status AS ENUM (
  'pending',
  'completed',
  'failed',
  'cancelled'
);

-- Payment methods
CREATE TYPE payment_method AS ENUM (
  'stripe',
  'pse',
  'bold',
  'wompi'
);

-- Wallet transactions (history)
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  balance_before DECIMAL(10, 2) NOT NULL,
  balance_after DECIMAL(10, 2) NOT NULL,
  status transaction_status NOT NULL DEFAULT 'pending',
  payment_method payment_method,
  payment_id VARCHAR(255), -- External payment ID (Stripe, PSE, etc)
  payment_metadata JSONB, -- Additional payment data
  description TEXT,
  reference_id INT, -- References bet_id or market_id
  reference_type VARCHAR(50), -- 'bet', 'market', 'deposit', 'withdrawal'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_wallet_transactions_user ON wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_type ON wallet_transactions(type);
CREATE INDEX idx_wallet_transactions_status ON wallet_transactions(status);
CREATE INDEX idx_wallet_transactions_created ON wallet_transactions(created_at DESC);

-- ============================================
-- 2. MARKETS SYSTEM
-- ============================================

-- Market categories
CREATE TYPE market_category AS ENUM (
  'sports_soccer',
  'sports_basketball',
  'sports_tennis',
  'sports_other',
  'politics',
  'entertainment',
  'prediction'
);

-- Market status
CREATE TYPE market_status AS ENUM (
  'draft',        -- Created but not visible
  'open',         -- Accepting bets
  'locked',       -- No more bets (event started)
  'resolving',    -- Admin is resolving
  'resolved',     -- Winner determined, payouts processed
  'cancelled'     -- Cancelled (refunds issued)
);

-- Markets (events to bet on)
CREATE TABLE IF NOT EXISTS markets (
  id SERIAL PRIMARY KEY,
  category market_category NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Market options (JSON array of options)
  -- Example: ["Junior de Barranquilla", "Atlético Nacional", "Empate"]
  -- Example: ["Gustavo Petro", "Federico Gutiérrez", "Sergio Fajardo"]
  options JSONB NOT NULL,

  -- Timing
  opens_at TIMESTAMP WITH TIME ZONE NOT NULL, -- When betting opens
  closes_at TIMESTAMP WITH TIME ZONE NOT NULL, -- When betting closes
  event_date TIMESTAMP WITH TIME ZONE NOT NULL, -- Actual event date

  -- Resolution
  status market_status NOT NULL DEFAULT 'draft',
  winning_option INT, -- Index of winning option (0-based)
  resolution_source TEXT, -- URL or description of official source
  resolved_by UUID REFERENCES user_profiles(id), -- Admin who resolved
  resolved_at TIMESTAMP WITH TIME ZONE,

  -- Metadata
  image_url TEXT,
  external_id VARCHAR(255), -- For sports APIs
  metadata JSONB, -- Additional data

  -- Limits
  min_bet DECIMAL(10, 2) NOT NULL DEFAULT 1.00,
  max_bet DECIMAL(10, 2) NOT NULL DEFAULT 100.00,
  max_total_bet DECIMAL(10, 2) NOT NULL DEFAULT 500.00,

  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_markets_status ON markets(status);
CREATE INDEX idx_markets_category ON markets(category);
CREATE INDEX idx_markets_closes_at ON markets(closes_at);
CREATE INDEX idx_markets_event_date ON markets(event_date);

-- ============================================
-- 3. BETTING SYSTEM
-- ============================================

-- Bet status
CREATE TYPE bet_status AS ENUM (
  'active',     -- Bet placed, market not resolved
  'won',        -- User won
  'lost',       -- User lost
  'refunded'    -- Market cancelled
);

-- Individual bets
CREATE TABLE IF NOT EXISTS bets (
  id SERIAL PRIMARY KEY,
  market_id INT NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Bet details
  option_index INT NOT NULL, -- Which option they bet on (0-based)
  amount DECIMAL(10, 2) NOT NULL,

  -- User's subscription status at time of bet
  is_premium BOOLEAN NOT NULL DEFAULT FALSE,

  -- Commission rate applied (stored for historical accuracy)
  commission_rate DECIMAL(5, 4) NOT NULL, -- 0.06 or 0.03

  -- Payout (calculated after resolution)
  status bet_status NOT NULL DEFAULT 'active',
  payout DECIMAL(10, 2), -- NULL until resolved
  commission_charged DECIMAL(10, 2), -- NULL until resolved
  net_payout DECIMAL(10, 2), -- payout - commission

  -- Odds at time of bet placement (for display)
  estimated_odds DECIMAL(10, 4), -- Snapshot of odds when bet placed

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_bets_market ON bets(market_id);
CREATE INDEX idx_bets_user ON bets(user_id);
CREATE INDEX idx_bets_status ON bets(status);
CREATE INDEX idx_bets_created ON bets(created_at DESC);

-- ============================================
-- 4. POOL STATISTICS (Denormalized for performance)
-- ============================================

-- Real-time pool stats per market option
CREATE TABLE IF NOT EXISTS pool_stats (
  market_id INT NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  option_index INT NOT NULL,

  -- Pool totals
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  total_bets INT NOT NULL DEFAULT 0,

  -- User breakdown
  premium_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  premium_bets INT NOT NULL DEFAULT 0,
  free_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  free_bets INT NOT NULL DEFAULT 0,

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  PRIMARY KEY (market_id, option_index)
);

CREATE INDEX idx_pool_stats_market ON pool_stats(market_id);

-- ============================================
-- 5. TRIGGERS & FUNCTIONS
-- ============================================

-- Auto-create wallet when user registers
CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_wallets (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_wallet
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_user_wallet();

-- Update wallet updated_at on balance change
CREATE OR REPLACE FUNCTION update_wallet_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_wallet_timestamp
  BEFORE UPDATE ON user_wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_wallet_timestamp();

-- Update market updated_at
CREATE OR REPLACE FUNCTION update_market_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_market_timestamp
  BEFORE UPDATE ON markets
  FOR EACH ROW
  EXECUTE FUNCTION update_market_timestamp();

-- Update pool stats when bet is placed
CREATE OR REPLACE FUNCTION update_pool_stats_on_bet()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update pool stats
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

CREATE TRIGGER trigger_update_pool_stats
  AFTER INSERT ON bets
  FOR EACH ROW
  EXECUTE FUNCTION update_pool_stats_on_bet();

-- ============================================
-- 6. CREATE WALLETS FOR EXISTING USERS
-- ============================================

-- Create wallets for all existing users
INSERT INTO user_wallets (user_id, balance)
SELECT id, 0.00
FROM user_profiles
WHERE id NOT IN (SELECT user_id FROM user_wallets)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- 7. RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_stats ENABLE ROW LEVEL SECURITY;

-- Wallets: Users can only see their own
CREATE POLICY wallet_select_own ON user_wallets
  FOR SELECT USING (auth.uid() = user_id);

-- Wallet transactions: Users can only see their own
CREATE POLICY transactions_select_own ON wallet_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Markets: Everyone can view open/resolved markets
CREATE POLICY markets_select_public ON markets
  FOR SELECT USING (status IN ('open', 'locked', 'resolved'));

-- Bets: Users can only see their own bets
CREATE POLICY bets_select_own ON bets
  FOR SELECT USING (auth.uid() = user_id);

-- Pool stats: Everyone can view (public info)
CREATE POLICY pool_stats_select_public ON pool_stats
  FOR SELECT USING (true);

-- Admin policies (superadmin can do everything)
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

-- ============================================
-- 8. HELPER VIEWS
-- ============================================

-- Market summary with pool totals
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

-- User betting history with market info
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

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE user_wallets IS 'User balance and wallet statistics for PolyBet Pools';
COMMENT ON TABLE wallet_transactions IS 'All wallet movements (deposits, withdrawals, bets, payouts)';
COMMENT ON TABLE markets IS 'Betting markets (sports, politics, entertainment, predictions)';
COMMENT ON TABLE bets IS 'Individual user bets on markets';
COMMENT ON TABLE pool_stats IS 'Denormalized pool statistics for fast odds calculation';

COMMENT ON COLUMN markets.options IS 'JSON array of betting options, e.g. ["Option 1", "Option 2", "Option 3"]';
COMMENT ON COLUMN markets.winning_option IS 'Zero-based index of winning option from options array';
COMMENT ON COLUMN bets.commission_rate IS 'Commission rate at time of bet (0.06 for free users, 0.03 for premium)';
COMMENT ON COLUMN bets.estimated_odds IS 'Estimated payout multiplier at time bet was placed';

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify tables were created
DO $$
BEGIN
  RAISE NOTICE 'PolyBet Pools tables created successfully!';
  RAISE NOTICE 'Tables: user_wallets, wallet_transactions, markets, bets, pool_stats';
  RAISE NOTICE 'Views: market_summary, user_bet_history';
  RAISE NOTICE 'Triggers: Auto wallet creation, pool stats updates';
END $$;
