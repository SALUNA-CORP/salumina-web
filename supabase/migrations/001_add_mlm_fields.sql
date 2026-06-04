-- ============================================================================
-- MIGRACIÓN: Agregar campos MLM a estructura existente
-- Fecha: 2026-06-04
-- Descripción: Agrega campos del sistema binario MLM sin perder datos existentes
-- ============================================================================

-- 1. AGREGAR COLUMNAS FALTANTES A user_profiles
-- ============================================================================

DO $$
BEGIN
  -- referral_code (único por usuario)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'referral_code'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN referral_code TEXT;
  END IF;

  -- sponsor_id (quién te refirió)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'sponsor_id'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN sponsor_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL;
  END IF;

  -- placement_parent_id (padre en árbol binario)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'placement_parent_id'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN placement_parent_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL;
  END IF;

  -- leg (pierna en el árbol: left/right)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'leg'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN leg TEXT CHECK (leg IN ('left', 'right'));
  END IF;

  -- placement_locked_at (fecha cuando se bloqueó la ubicación)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'placement_locked_at'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN placement_locked_at TIMESTAMPTZ;
  END IF;

  -- updated_at (si no existe)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Crear índices para las nuevas columnas
CREATE INDEX IF NOT EXISTS idx_user_profiles_referral_code ON user_profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_user_profiles_sponsor ON user_profiles(sponsor_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_placement ON user_profiles(placement_parent_id, leg);

-- Generar referral_code único para usuarios que no lo tengan
UPDATE user_profiles
SET referral_code = UPPER(
  SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4) ||
  SUBSTRING(MD5(id::TEXT) FROM 1 FOR 4)
)
WHERE referral_code IS NULL;

-- Hacer referral_code único y NOT NULL después de generar códigos
ALTER TABLE user_profiles
  ALTER COLUMN referral_code SET NOT NULL,
  ADD CONSTRAINT user_profiles_referral_code_unique UNIQUE (referral_code);

-- 2. CREAR TABLA commission_config
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

-- 3. CREAR TABLA binary_commission_levels
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

-- 4. CREAR TABLA subscription_bookmakers (relación muchos a muchos)
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscription_bookmakers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  bookmaker_id UUID NOT NULL REFERENCES bookmakers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subscription_id, bookmaker_id)
);

CREATE INDEX IF NOT EXISTS idx_subscription_bookmakers_sub ON subscription_bookmakers(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_bookmakers_book ON subscription_bookmakers(bookmaker_id);

-- 5. AGREGAR COLUMNAS FALTANTES A subscriptions (si no existen)
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'base_amount'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN base_amount DECIMAL(10,2) DEFAULT 20.00;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'bookmaker_amount'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN bookmaker_amount DECIMAL(10,2) DEFAULT 0.00;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'total_amount'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN total_amount DECIMAL(10,2) NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'current_period_start'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN current_period_start TIMESTAMPTZ DEFAULT NOW();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'current_period_end'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN current_period_end TIMESTAMPTZ;
  END IF;
END $$;

-- 6. AJUSTAR TABLA bookmakers (asegurar columnas necesarias)
-- ============================================================================

DO $$
BEGIN
  -- slug para identificar bookmakers
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookmakers' AND column_name = 'slug'
  ) THEN
    ALTER TABLE bookmakers ADD COLUMN slug TEXT;
  END IF;

  -- name si no existe (puede llamarse 'title')
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookmakers' AND column_name = 'name'
  ) THEN
    -- Si existe 'title', copiarlo a 'name'
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'bookmakers' AND column_name = 'title'
    ) THEN
      ALTER TABLE bookmakers ADD COLUMN name TEXT;
      UPDATE bookmakers SET name = title WHERE name IS NULL;
    ELSE
      ALTER TABLE bookmakers ADD COLUMN name TEXT;
    END IF;
  END IF;

  -- price (precio por bookmaker)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookmakers' AND column_name = 'price'
  ) THEN
    ALTER TABLE bookmakers ADD COLUMN price DECIMAL(10,2) DEFAULT 5.00;
  END IF;

  -- is_active
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookmakers' AND column_name = 'is_active'
  ) THEN
    -- Renombrar 'active' a 'is_active' si existe
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'bookmakers' AND column_name = 'active'
    ) THEN
      ALTER TABLE bookmakers RENAME COLUMN active TO is_active;
    ELSE
      ALTER TABLE bookmakers ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
  END IF;
END $$;

-- Generar slug si no existe (basado en 'key' o 'name')
UPDATE bookmakers
SET slug = LOWER(REGEXP_REPLACE(COALESCE(key, name), '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;

-- 7. FUNCIONES Y TRIGGERS
-- ============================================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers para commission_config
DROP TRIGGER IF EXISTS update_commission_config_updated_at ON commission_config;
CREATE TRIGGER update_commission_config_updated_at
  BEFORE UPDATE ON commission_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Triggers para binary_commission_levels
DROP TRIGGER IF EXISTS update_binary_commission_levels_updated_at ON binary_commission_levels;
CREATE TRIGGER update_binary_commission_levels_updated_at
  BEFORE UPDATE ON binary_commission_levels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RESUMEN DE CAMBIOS
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migración completada:';
  RAISE NOTICE '   - Agregadas columnas MLM a user_profiles';
  RAISE NOTICE '   - Generados referral_codes únicos';
  RAISE NOTICE '   - Creada tabla commission_config';
  RAISE NOTICE '   - Creada tabla binary_commission_levels (niveles 2-20)';
  RAISE NOTICE '   - Creada tabla subscription_bookmakers';
  RAISE NOTICE '   - Ajustadas tablas subscriptions y bookmakers';
  RAISE NOTICE '   - Creados triggers para updated_at';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  PENDIENTE: Ejecutar migración 002_set_superadmin.sql';
END $$;
