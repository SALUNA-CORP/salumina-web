-- =====================================================
-- MIGRATION: New Features System
-- Description: Adds tables for new features
--   - Market Favorites
--   - Market Alerts
--   - Achievements/Badges
--   - Unified Notifications
--   - Training Materials
-- =====================================================

-- =====================================================
-- 1. MARKET FAVORITES
-- =====================================================

CREATE TABLE IF NOT EXISTS market_favorites (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  market_id BIGINT NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(user_id, market_id)
);

CREATE INDEX idx_market_favorites_user ON market_favorites(user_id);
CREATE INDEX idx_market_favorites_market ON market_favorites(market_id);

-- RLS Policies
ALTER TABLE market_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favorites"
  ON market_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites"
  ON market_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorites"
  ON market_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 2. MARKET ALERTS
-- =====================================================

CREATE TABLE IF NOT EXISTS market_alerts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  market_id BIGINT NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL, -- 'odds_change', 'pool_threshold', 'closing_soon', 'status_change'

  -- Alert conditions (JSON)
  conditions JSONB NOT NULL DEFAULT '{}', -- {threshold_amount: 1000, percentage_change: 20, hours_before_close: 1}

  -- Alert state
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  triggered_at TIMESTAMPTZ,
  notification_sent BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_market_alerts_user ON market_alerts(user_id);
CREATE INDEX idx_market_alerts_market ON market_alerts(market_id);
CREATE INDEX idx_market_alerts_active ON market_alerts(is_active) WHERE is_active = TRUE;

-- RLS Policies
ALTER TABLE market_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own alerts"
  ON market_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own alerts"
  ON market_alerts FOR ALL
  USING (auth.uid() = user_id);

-- =====================================================
-- 3. ACHIEVEMENTS SYSTEM
-- =====================================================

-- Achievements catalog
CREATE TABLE IF NOT EXISTS achievements (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL, -- 'first_bet', 'top_recruiter', 'diamond_network'
  category VARCHAR(50) NOT NULL, -- 'pools', 'mlm', 'general'
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(100), -- emoji or icon name
  rarity VARCHAR(20) NOT NULL DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'

  -- Unlock conditions (JSON)
  unlock_conditions JSONB NOT NULL DEFAULT '{}',
  -- Examples:
  -- {type: 'bets_count', count: 10}
  -- {type: 'win_rate', percentage: 70, min_bets: 20}
  -- {type: 'referrals_count', count: 5}
  -- {type: 'network_size', size: 50}

  -- Rewards (optional)
  rewards JSONB DEFAULT '{}', -- {bonus_balance: 10, commission_multiplier: 1.1}

  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User achievements (unlocked badges)
CREATE TABLE IF NOT EXISTS user_achievements (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  achievement_id BIGINT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  progress JSONB DEFAULT '{}', -- Current progress towards achievement

  UNIQUE(user_id, achievement_id)
);

CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement ON user_achievements(achievement_id);

-- RLS Policies
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active achievements"
  ON achievements FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

-- =====================================================
-- 4. UNIFIED NOTIFICATIONS SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Notification content
  type VARCHAR(50) NOT NULL, -- 'new_referral', 'commission_earned', 'bet_won', 'alert_triggered', 'achievement_unlocked'
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,

  -- Metadata
  data JSONB DEFAULT '{}', -- Additional data (market_id, amount, etc.)
  action_url VARCHAR(500), -- Deep link or URL to relevant page

  -- Delivery channels
  sent_email BOOLEAN NOT NULL DEFAULT FALSE,
  sent_push BOOLEAN NOT NULL DEFAULT FALSE,
  sent_sms BOOLEAN NOT NULL DEFAULT FALSE,

  -- User interaction
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ -- Optional expiration
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- =====================================================
-- 5. TRAINING MATERIALS (MLM)
-- =====================================================

CREATE TABLE IF NOT EXISTS training_materials (
  id BIGSERIAL PRIMARY KEY,

  -- Content
  title VARCHAR(200) NOT NULL,
  description TEXT,
  content_type VARCHAR(50) NOT NULL, -- 'video', 'article', 'pdf', 'webinar'
  content_url VARCHAR(500), -- YouTube, Drive, etc.
  content_text TEXT, -- For articles

  -- Organization
  category VARCHAR(50) NOT NULL, -- 'recruitment', 'sales', 'platform', 'success_stories'
  difficulty VARCHAR(20) NOT NULL DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
  duration_minutes INT, -- Estimated time to complete

  -- Access control
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  required_rank VARCHAR(50), -- Optional: only for certain ranks

  -- Metadata
  thumbnail_url VARCHAR(500),
  tags TEXT[], -- Searchable tags
  view_count INT NOT NULL DEFAULT 0,

  -- Status
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

CREATE INDEX idx_training_category ON training_materials(category);
CREATE INDEX idx_training_active ON training_materials(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_training_published ON training_materials(published_at DESC);

-- User training progress
CREATE TABLE IF NOT EXISTS user_training_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  material_id BIGINT NOT NULL REFERENCES training_materials(id) ON DELETE CASCADE,

  -- Progress
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  progress_percentage INT NOT NULL DEFAULT 0,
  time_spent_minutes INT NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, material_id)
);

CREATE INDEX idx_user_training_user ON user_training_progress(user_id);
CREATE INDEX idx_user_training_material ON user_training_progress(material_id);

-- RLS Policies
ALTER TABLE training_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_training_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view public training materials"
  ON training_materials FOR SELECT
  USING (is_active = TRUE AND is_public = TRUE);

CREATE POLICY "Admins can manage training materials"
  ON training_materials FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY "Users can view their own training progress"
  ON user_training_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own training progress"
  ON user_training_progress FOR ALL
  USING (auth.uid() = user_id);

-- =====================================================
-- 6. HELPER FUNCTIONS
-- =====================================================

-- Function to get unread notifications count
CREATE OR REPLACE FUNCTION get_unread_notifications_count(p_user_id UUID)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM notifications
    WHERE user_id = p_user_id
      AND is_read = FALSE
      AND (expires_at IS NULL OR expires_at > NOW())
  );
END;
$$;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE notifications
  SET is_read = TRUE,
      read_at = NOW()
  WHERE id = p_notification_id
    AND user_id = auth.uid();

  RETURN FOUND;
END;
$$;

-- Function to check if user has favorited a market
CREATE OR REPLACE FUNCTION is_market_favorited(p_user_id UUID, p_market_id BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM market_favorites
    WHERE user_id = p_user_id AND market_id = p_market_id
  );
END;
$$;

-- =====================================================
-- 7. SEED DATA - Sample Achievements
-- =====================================================

INSERT INTO achievements (code, category, name, description, icon, rarity, unlock_conditions) VALUES
  ('first_bet', 'pools', 'Primera Predicción', 'Realizaste tu primera participación en un mercado', '🎯', 'common', '{"type": "bets_count", "count": 1}'),
  ('bet_streak_10', 'pools', 'Racha de 10', 'Participaste en 10 mercados consecutivos', '🔥', 'rare', '{"type": "bets_count", "count": 10}'),
  ('win_rate_70', 'pools', 'Estratega', 'Alcanzaste 70% de aciertos (mínimo 20 predicciones)', '🧠', 'epic', '{"type": "win_rate", "percentage": 70, "min_bets": 20}'),
  ('profit_1000', 'pools', 'Ganador Profesional', 'Ganancias totales de $1,000', '💰', 'epic', '{"type": "total_profit", "amount": 1000}'),

  ('first_referral', 'mlm', 'Primer Referido', 'Invitaste a tu primera persona', '🤝', 'common', '{"type": "referrals_count", "count": 1}'),
  ('recruiter_10', 'mlm', 'Reclutador Activo', 'Invitaste a 10 personas', '👥', 'rare', '{"type": "referrals_count", "count": 10}'),
  ('network_50', 'mlm', 'Constructor de Red', 'Tu red alcanzó 50 personas', '🌐', 'epic', '{"type": "network_size", "size": 50}'),
  ('diamond_network', 'mlm', 'Red Diamante', 'Tu red alcanzó 200 personas', '💎', 'legendary', '{"type": "network_size", "size": 200}'),
  ('commission_500', 'mlm', 'Comisionista Pro', 'Ganaste $500 en comisiones', '💵', 'epic', '{"type": "total_commissions", "amount": 500}'),

  ('training_complete', 'general', 'Estudiante Dedicado', 'Completaste 5 materiales de capacitación', '📚', 'common', '{"type": "training_completed", "count": 5}'),
  ('early_adopter', 'general', 'Adoptador Temprano', 'Te uniste en los primeros 100 usuarios', '🚀', 'legendary', '{"type": "user_rank", "max_rank": 100}'),
  ('active_trader', 'general', 'Trader Activo', 'Activo por 30 días consecutivos', '📈', 'rare', '{"type": "active_days", "count": 30}')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration 012 completed successfully!';
  RAISE NOTICE '📊 New tables created:';
  RAISE NOTICE '   - market_favorites (favorite markets)';
  RAISE NOTICE '   - market_alerts (market alerts system)';
  RAISE NOTICE '   - achievements (badges catalog)';
  RAISE NOTICE '   - user_achievements (unlocked badges)';
  RAISE NOTICE '   - notifications (unified notifications)';
  RAISE NOTICE '   - training_materials (MLM training content)';
  RAISE NOTICE '   - user_training_progress (training progress tracking)';
  RAISE NOTICE '🎯 12 sample achievements seeded';
  RAISE NOTICE '🔒 RLS policies enabled for all tables';
END $$;
