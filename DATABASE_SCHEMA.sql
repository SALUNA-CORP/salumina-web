-- =====================================================
-- SALUMINA - Base de Datos Completa
-- Sistema Binario con Suscripciones
-- PostgreSQL (Supabase)
-- =====================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLA: user_profiles
-- Extends Supabase auth.users
-- Información de usuarios y estructura binaria
-- =====================================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,

  -- Sistema de referidos
  referral_code TEXT UNIQUE NOT NULL,
  sponsor_id UUID REFERENCES user_profiles(id), -- Quien lo refirió

  -- Posición en red binaria
  placement_parent_id UUID REFERENCES user_profiles(id), -- Padre en el árbol
  leg TEXT CHECK (leg IN ('left', 'right')), -- En qué pierna está
  placement_locked_at TIMESTAMP, -- Cuando se bloqueó la ubicación

  -- Estado y rol
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive', 'cancelled')),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superadmin')),

  -- Wallets para retiros
  crypto_wallet_usdt TEXT,
  crypto_wallet_usdc TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_user_sponsor ON user_profiles(sponsor_id);
CREATE INDEX idx_user_placement_parent ON user_profiles(placement_parent_id);
CREATE INDEX idx_user_referral_code ON user_profiles(referral_code);
CREATE INDEX idx_user_status ON user_profiles(status);

-- =====================================================
-- TABLA: subscriptions
-- Suscripciones de usuarios
-- =====================================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Plan
  plan_base_price DECIMAL(10,2) DEFAULT 20.00,
  bookmakers JSONB DEFAULT '[]'::jsonb, -- ['pinnacle', 'betplay', 'polymarket']
  total_price DECIMAL(10,2) NOT NULL, -- base + (num_bookmakers * price_per_bookmaker)

  -- Moneda y pago
  currency TEXT NOT NULL CHECK (currency IN ('USD', 'COP')),
  payment_method TEXT, -- 'stripe', 'bold', 'crypto'

  -- Estado
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'cancelled', 'expired')),

  -- Períodos
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  cancelled_at TIMESTAMP
);

-- Índices
CREATE INDEX idx_subscription_user ON subscriptions(user_id);
CREATE INDEX idx_subscription_status ON subscriptions(status);
CREATE INDEX idx_subscription_period_end ON subscriptions(current_period_end);

-- =====================================================
-- TABLA: payments
-- Historial de pagos de suscripciones
-- =====================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Monto
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('USD', 'COP')),

  -- Método de pago
  payment_method TEXT NOT NULL, -- 'stripe', 'bold', 'crypto'
  payment_provider TEXT NOT NULL, -- 'stripe', 'bold', 'coinpayments'
  provider_transaction_id TEXT, -- ID de la transacción en el proveedor

  -- Estado
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_payment_user ON payments(user_id);
CREATE INDEX idx_payment_subscription ON payments(subscription_id);
CREATE INDEX idx_payment_status ON payments(status);
CREATE INDEX idx_payment_provider_tx ON payments(provider_transaction_id);

-- =====================================================
-- TABLA: commission_config
-- Configuración global de comisiones
-- Solo debe haber 1 registro
-- =====================================================
CREATE TABLE commission_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Comisión directa (nivel 1)
  direct_percentage DECIMAL(5,2) DEFAULT 20.00 CHECK (direct_percentage >= 0 AND direct_percentage <= 100),

  -- Configuración de retiros
  min_withdrawal_usd DECIMAL(10,2) DEFAULT 50.00,
  min_withdrawal_cop DECIMAL(10,2) DEFAULT 200000.00,

  -- Configuración de red binaria
  placement_change_days INTEGER DEFAULT 3, -- Días para cambiar ubicación de referido

  -- Timestamps
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES user_profiles(id)
);

-- Insertar configuración por defecto
INSERT INTO commission_config (direct_percentage, min_withdrawal_usd, min_withdrawal_cop, placement_change_days)
VALUES (20.00, 50.00, 200000.00, 3);

-- =====================================================
-- TABLA: binary_commission_levels
-- Porcentajes de comisión por cada nivel (2-20)
-- =====================================================
CREATE TABLE binary_commission_levels (
  level INTEGER PRIMARY KEY CHECK (level >= 2 AND level <= 20),
  percentage DECIMAL(5,2) DEFAULT 3.00 CHECK (percentage >= 0 AND percentage <= 100),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES user_profiles(id)
);

-- Insertar niveles por defecto (todos en 3%)
INSERT INTO binary_commission_levels (level, percentage)
SELECT generate_series(2, 20), 3.00;

-- =====================================================
-- TABLA: commissions
-- Comisiones generadas para cada usuario
-- =====================================================
CREATE TABLE commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Tipo de comisión
  type TEXT NOT NULL CHECK (type IN ('direct', 'binary')),

  -- Origen
  from_user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL, -- Quien generó la comisión
  from_payment_id UUID REFERENCES payments(id) ON DELETE SET NULL, -- Pago que generó la comisión
  level INTEGER, -- Solo para binarias: nivel en el que se generó
  leg TEXT CHECK (leg IN ('left', 'right')), -- Solo para binarias: de qué pierna viene

  -- Monto
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('USD', 'COP')),

  -- Período
  period_month TEXT NOT NULL, -- '2026-06' - mes al que corresponde

  -- Estado
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'available', 'withdrawn', 'applied_to_subscription')),

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_commission_user ON commissions(user_id);
CREATE INDEX idx_commission_type ON commissions(type);
CREATE INDEX idx_commission_status ON commissions(status);
CREATE INDEX idx_commission_period ON commissions(period_month);
CREATE INDEX idx_commission_from_user ON commissions(from_user_id);

-- =====================================================
-- TABLA: withdrawals
-- Solicitudes de retiro de comisiones
-- =====================================================
CREATE TABLE withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Monto
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('USD', 'COP')),

  -- Destino (wallet cripto)
  wallet_address TEXT NOT NULL,
  wallet_type TEXT NOT NULL CHECK (wallet_type IN ('USDT', 'USDC')),

  -- Estado
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'failed')),

  -- Aprobación
  admin_notes TEXT,
  approved_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMP,

  -- Procesamiento
  transaction_hash TEXT, -- Hash de la transacción blockchain
  completed_at TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_withdrawal_user ON withdrawals(user_id);
CREATE INDEX idx_withdrawal_status ON withdrawals(status);
CREATE INDEX idx_withdrawal_created ON withdrawals(created_at DESC);

-- =====================================================
-- TABLA: bookmakers
-- Casas de apuestas disponibles (configuración global)
-- =====================================================
CREATE TABLE bookmakers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL, -- 'pinnacle', 'betplay', 'polymarket'
  name TEXT NOT NULL, -- 'Pinnacle', 'Betplay', 'Polymarket'
  price DECIMAL(10,2) DEFAULT 5.00, -- Precio mensual por esta casa
  active BOOLEAN DEFAULT true, -- Si está disponible para selección
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insertar casas por defecto
INSERT INTO bookmakers (key, name, price, active) VALUES
  ('pinnacle', 'Pinnacle', 5.00, true),
  ('betplay', 'Betplay', 5.00, true),
  ('polymarket', 'Polymarket', 5.00, true);

-- =====================================================
-- TABLA: binary_network
-- Tabla materializada para performance de red binaria
-- Almacena estadísticas calculadas de cada usuario
-- =====================================================
CREATE TABLE binary_network (
  user_id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Volumen de cada pierna (suma de pagos mensuales de todos los descendientes)
  left_leg_volume DECIMAL(10,2) DEFAULT 0,
  right_leg_volume DECIMAL(10,2) DEFAULT 0,

  -- Contadores de usuarios activos
  left_leg_active_count INTEGER DEFAULT 0,
  right_leg_active_count INTEGER DEFAULT 0,

  -- Totales
  total_network_volume DECIMAL(10,2) DEFAULT 0,
  total_network_count INTEGER DEFAULT 0,

  -- Profundidad máxima
  max_depth_left INTEGER DEFAULT 0,
  max_depth_right INTEGER DEFAULT 0,

  -- Timestamps
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_binary_network_volumes ON binary_network(left_leg_volume, right_leg_volume);

-- =====================================================
-- TABLA: activity_log
-- Log de auditoría de acciones importantes
-- =====================================================
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  admin_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'user_created', 'subscription_activated', 'withdrawal_approved', etc
  entity_type TEXT, -- 'user', 'subscription', 'withdrawal', etc
  entity_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_activity_user ON activity_log(user_id);
CREATE INDEX idx_activity_admin ON activity_log(admin_id);
CREATE INDEX idx_activity_action ON activity_log(action);
CREATE INDEX idx_activity_created ON activity_log(created_at DESC);

-- =====================================================
-- FUNCIONES AUXILIARES
-- =====================================================

-- Función para generar código de referido único
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generar código de 8 caracteres alfanuméricos
    code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));

    -- Verificar que no exista
    SELECT EXISTS(SELECT 1 FROM user_profiles WHERE referral_code = code) INTO exists;

    EXIT WHEN NOT exists;
  END LOOP;

  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Función para calcular volumen de una pierna (recursiva)
CREATE OR REPLACE FUNCTION calculate_leg_volume(parent_user_id UUID, leg_side TEXT)
RETURNS DECIMAL AS $$
DECLARE
  total DECIMAL := 0;
BEGIN
  WITH RECURSIVE downline AS (
    -- Caso base: hijos directos en la pierna especificada
    SELECT id, placement_parent_id
    FROM user_profiles
    WHERE placement_parent_id = parent_user_id
      AND leg = leg_side
      AND status = 'active'

    UNION ALL

    -- Caso recursivo: todos los descendientes
    SELECT u.id, u.placement_parent_id
    FROM user_profiles u
    INNER JOIN downline d ON u.placement_parent_id = d.id
    WHERE u.status = 'active'
  )
  SELECT COALESCE(SUM(s.total_price), 0) INTO total
  FROM downline d
  INNER JOIN subscriptions s ON s.user_id = d.id
  WHERE s.status = 'active';

  RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar estadísticas de red binaria
CREATE OR REPLACE FUNCTION update_binary_network_stats(target_user_id UUID)
RETURNS VOID AS $$
DECLARE
  left_vol DECIMAL;
  right_vol DECIMAL;
  left_count INTEGER;
  right_count INTEGER;
BEGIN
  -- Calcular volumen de pierna izquierda
  SELECT calculate_leg_volume(target_user_id, 'left') INTO left_vol;

  -- Calcular volumen de pierna derecha
  SELECT calculate_leg_volume(target_user_id, 'right') INTO right_vol;

  -- Contar activos en pierna izquierda
  WITH RECURSIVE left_downline AS (
    SELECT id FROM user_profiles
    WHERE placement_parent_id = target_user_id AND leg = 'left' AND status = 'active'
    UNION ALL
    SELECT u.id FROM user_profiles u
    INNER JOIN left_downline d ON u.placement_parent_id = d.id
    WHERE u.status = 'active'
  )
  SELECT COUNT(*) INTO left_count FROM left_downline;

  -- Contar activos en pierna derecha
  WITH RECURSIVE right_downline AS (
    SELECT id FROM user_profiles
    WHERE placement_parent_id = target_user_id AND leg = 'right' AND status = 'active'
    UNION ALL
    SELECT u.id FROM user_profiles u
    INNER JOIN right_downline d ON u.placement_parent_id = d.id
    WHERE u.status = 'active'
  )
  SELECT COUNT(*) INTO right_count FROM right_downline;

  -- Actualizar o insertar en binary_network
  INSERT INTO binary_network (
    user_id, left_leg_volume, right_leg_volume,
    left_leg_active_count, right_leg_active_count,
    total_network_volume, total_network_count, updated_at
  ) VALUES (
    target_user_id, left_vol, right_vol,
    left_count, right_count,
    left_vol + right_vol, left_count + right_count, NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    left_leg_volume = EXCLUDED.left_leg_volume,
    right_leg_volume = EXCLUDED.right_leg_volume,
    left_leg_active_count = EXCLUDED.left_leg_active_count,
    right_leg_active_count = EXCLUDED.right_leg_active_count,
    total_network_volume = EXCLUDED.total_network_volume,
    total_network_count = EXCLUDED.total_network_count,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger para generar referral_code automáticamente
CREATE OR REPLACE FUNCTION trigger_set_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_referral_code_before_insert
BEFORE INSERT ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION trigger_set_referral_code();

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_user_profiles
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_subscriptions
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_payments
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_withdrawals
BEFORE UPDATE ON withdrawals
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

-- Políticas para user_profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Políticas para subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
  ON subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Políticas para commissions
CREATE POLICY "Users can view their own commissions"
  ON commissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all commissions"
  ON commissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- Políticas para withdrawals
CREATE POLICY "Users can view their own withdrawals"
  ON withdrawals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own withdrawals"
  ON withdrawals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all withdrawals"
  ON withdrawals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
    )
  );

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista de usuarios con su red binaria
CREATE OR REPLACE VIEW v_users_with_network AS
SELECT
  u.id,
  u.email,
  u.full_name,
  u.referral_code,
  u.status,
  u.role,
  sponsor.email as sponsor_email,
  parent.email as placement_parent_email,
  u.leg,
  bn.left_leg_volume,
  bn.right_leg_volume,
  bn.left_leg_active_count,
  bn.right_leg_active_count,
  bn.total_network_volume,
  s.status as subscription_status,
  s.total_price as monthly_payment,
  s.bookmakers,
  u.created_at
FROM user_profiles u
LEFT JOIN user_profiles sponsor ON u.sponsor_id = sponsor.id
LEFT JOIN user_profiles parent ON u.placement_parent_id = parent.id
LEFT JOIN binary_network bn ON u.id = bn.user_id
LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active';

-- Vista de comisiones disponibles por usuario
CREATE OR REPLACE VIEW v_user_balances AS
SELECT
  user_id,
  currency,
  SUM(CASE WHEN status = 'available' THEN amount ELSE 0 END) as available_balance,
  SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_balance,
  SUM(CASE WHEN status = 'withdrawn' THEN amount ELSE 0 END) as withdrawn_total,
  COUNT(*) as total_commissions
FROM commissions
GROUP BY user_id, currency;

-- =====================================================
-- COMENTARIOS EN TABLAS
-- =====================================================

COMMENT ON TABLE user_profiles IS 'Perfiles de usuarios y estructura de red binaria';
COMMENT ON TABLE subscriptions IS 'Suscripciones mensuales de usuarios';
COMMENT ON TABLE payments IS 'Historial de pagos recibidos';
COMMENT ON TABLE commission_config IS 'Configuración global de comisiones';
COMMENT ON TABLE binary_commission_levels IS 'Porcentajes de comisión por nivel (2-20)';
COMMENT ON TABLE commissions IS 'Comisiones generadas para cada usuario';
COMMENT ON TABLE withdrawals IS 'Solicitudes de retiro de comisiones';
COMMENT ON TABLE bookmakers IS 'Casas de apuestas disponibles';
COMMENT ON TABLE binary_network IS 'Estadísticas calculadas de red binaria (tabla materializada)';
COMMENT ON TABLE activity_log IS 'Log de auditoría de acciones importantes';

-- =====================================================
-- FIN DEL SCHEMA
-- =====================================================
