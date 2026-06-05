-- =====================================================
-- DATOS DE PRUEBA PARA SISTEMA DE APUESTAS
-- =====================================================
-- Ejecuta esto en Supabase SQL Editor para probar el sistema
-- =====================================================

-- IMPORTANTE: Reemplaza estos IDs con los reales de tu base de datos:
-- - Reemplaza 'USER_ID_1', 'USER_ID_2', etc. con UUIDs reales de usuarios
-- - Reemplaza 'MARKET_ID' con el ID real del mercado (ej: 1, 2, etc.)

-- =====================================================
-- 1. CREAR USUARIOS DE PRUEBA (Si no existen)
-- =====================================================
-- Nota: Solo ejecuta esto si necesitas usuarios de prueba
-- Normalmente ya tendrás usuarios reales

-- =====================================================
-- 2. SIMULAR APUESTAS EN UN MERCADO
-- =====================================================
-- Mercado de ejemplo: Junior vs Atlético Nacional
-- ID del mercado: 1 (ajusta según tu DB)
-- Opciones:
--   - Opción 0: Junior de Barranquilla
--   - Opción 1: Empate
--   - Opción 2: Atlético Nacional

-- IMPORTANTE: Antes de ejecutar, ejecuta este query para obtener user IDs reales:
-- SELECT id, email FROM auth.users LIMIT 5;

-- Luego reemplaza los USER_ID_X con los UUIDs reales

-- Apuestas en Junior de Barranquilla (opción 0)
INSERT INTO bets (
  user_id,
  market_id,
  option_index,
  option_text,
  amount,
  potential_payout,
  odds,
  status
) VALUES
  -- Usuario 1 apuesta $50,000 a Junior
  ('USER_ID_1', 1, 0, 'Junior de Barranquilla', 50000, 100000, 2.0, 'pending'),

  -- Usuario 2 apuesta $30,000 a Junior
  ('USER_ID_2', 1, 0, 'Junior de Barranquilla', 30000, 60000, 2.0, 'pending'),

  -- Usuario 3 apuesta $20,000 a Junior
  ('USER_ID_3', 1, 0, 'Junior de Barranquilla', 20000, 40000, 2.0, 'pending');

-- Apuestas en Empate (opción 1)
INSERT INTO bets (
  user_id,
  market_id,
  option_index,
  option_text,
  amount,
  potential_payout,
  odds,
  status
) VALUES
  -- Usuario 4 apuesta $40,000 al Empate
  ('USER_ID_4', 1, 1, 'Empate', 40000, 120000, 3.0, 'pending'),

  -- Usuario 5 apuesta $25,000 al Empate
  ('USER_ID_5', 1, 1, 'Empate', 25000, 75000, 3.0, 'pending');

-- Apuestas en Atlético Nacional (opción 2)
INSERT INTO bets (
  user_id,
  market_id,
  option_index,
  option_text,
  amount,
  potential_payout,
  odds,
  status
) VALUES
  -- Usuario 6 apuesta $35,000 a Nacional
  ('USER_ID_6', 1, 2, 'Atlético Nacional', 35000, 87500, 2.5, 'pending'),

  -- Usuario 7 apuesta $45,000 a Nacional
  ('USER_ID_7', 1, 2, 'Atlético Nacional', 45000, 112500, 2.5, 'pending'),

  -- Usuario 8 apuesta $15,000 a Nacional
  ('USER_ID_8', 1, 2, 'Atlético Nacional', 15000, 37500, 2.5, 'pending');

-- =====================================================
-- RESUMEN DE APUESTAS SIMULADAS:
-- =====================================================
-- Junior de Barranquilla: $100,000 (3 apuestas)
-- Empate: $65,000 (2 apuestas)
-- Atlético Nacional: $95,000 (3 apuestas)
--
-- POOL TOTAL: $260,000
-- Total apuestas: 8
-- =====================================================

-- =====================================================
-- 3. ACTUALIZAR POOL STATS (Opcional - normalmente se hace automático)
-- =====================================================
-- Si tu sistema no actualiza automáticamente, ejecuta esto:

INSERT INTO pool_stats (market_id, option_index, total_amount, total_bets)
VALUES
  (1, 0, 100000, 3),  -- Junior: $100k en 3 apuestas
  (1, 1, 65000, 2),   -- Empate: $65k en 2 apuestas
  (1, 2, 95000, 3)    -- Nacional: $95k en 3 apuestas
ON CONFLICT (market_id, option_index)
DO UPDATE SET
  total_amount = EXCLUDED.total_amount,
  total_bets = EXCLUDED.total_bets,
  updated_at = NOW();

-- =====================================================
-- 4. VERIFICAR DATOS
-- =====================================================
-- Ejecuta estos queries para verificar:

-- Ver todas las apuestas del mercado 1
SELECT
  b.id,
  b.option_text,
  b.amount,
  b.odds,
  b.status,
  u.email as apostador
FROM bets b
LEFT JOIN auth.users u ON b.user_id = u.id
WHERE b.market_id = 1
ORDER BY b.option_index, b.created_at;

-- Ver stats del pool
SELECT
  option_index,
  total_amount,
  total_bets,
  ROUND((total_amount::DECIMAL / (SELECT SUM(total_amount) FROM pool_stats WHERE market_id = 1) * 100), 2) as porcentaje
FROM pool_stats
WHERE market_id = 1
ORDER BY option_index;

-- Ver pool total
SELECT
  SUM(total_amount) as pool_total,
  SUM(total_bets) as total_apuestas
FROM pool_stats
WHERE market_id = 1;

-- =====================================================
-- 5. INSTRUCCIONES PARA USAR
-- =====================================================
--
-- PASO 1: Obtén los IDs reales
--   SELECT id, email FROM auth.users LIMIT 10;
--
-- PASO 2: Reemplaza USER_ID_1, USER_ID_2, etc. con los UUIDs reales
--
-- PASO 3: Verifica el ID del mercado (probablemente es 1 o 2)
--   SELECT id, title FROM markets LIMIT 5;
--
-- PASO 4: Ejecuta los INSERT de apuestas
--
-- PASO 5: Verifica con los SELECT del final
--
-- PASO 6: Abre el mercado en la UI y verás:
--   - Pool total: $260,000
--   - Junior: $100,000 (38.5%)
--   - Empate: $65,000 (25%)
--   - Nacional: $95,000 (36.5%)
--
-- =====================================================

-- =====================================================
-- BONUS: LIMPIAR DATOS DE PRUEBA
-- =====================================================
-- Si quieres borrar todo y empezar de nuevo:
/*
DELETE FROM bets WHERE market_id = 1;
DELETE FROM pool_stats WHERE market_id = 1;
*/
