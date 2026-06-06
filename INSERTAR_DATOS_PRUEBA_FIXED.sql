-- =====================================================
-- DATOS DE PRUEBA PARA SISTEMA DE APUESTAS - VERSIÓN CORREGIDA
-- =====================================================

-- PASO 1: Verificar la estructura de la tabla bets
-- Ejecuta esto primero para ver qué columnas existen:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'bets';

-- =====================================================
-- ESTRUCTURA CORRECTA (sin option_text):
-- =====================================================
-- La tabla bets tiene:
-- - user_id
-- - market_id
-- - option_index
-- - amount
-- - potential_payout (calculado automáticamente)
-- - odds (calculado automáticamente)
-- - status
-- - commission_rate
-- - is_premium
-- - etc.

-- =====================================================
-- INSERTS SIMPLIFICADOS (sin option_text)
-- =====================================================

-- Apuestas en Junior de Barranquilla (opción 0)
INSERT INTO bets (
  user_id,
  market_id,
  option_index,
  amount,
  commission_rate,
  is_premium,
  status
) VALUES
  ('4437e1fa-e501-4507-9df4-286721ecf92b', 1, 0, 50000, 0.06, false, 'active'),
  ('9d2270a3-2beb-429d-a320-a9aada38d488', 1, 0, 30000, 0.06, false, 'active'),
  ('3a727e32-ff02-465f-925c-c2c4edb7683a', 1, 0, 20000, 0.06, false, 'active');

-- Apuestas en Empate (opción 1)
INSERT INTO bets (
  user_id,
  market_id,
  option_index,
  amount,
  commission_rate,
  is_premium,
  status
) VALUES
  ('4437e1fa-e501-4507-9df4-286721ecf92b', 1, 1, 40000, 0.06, false, 'active'),
  ('3a727e32-ff02-465f-925c-c2c4edb7683a', 1, 1, 25000, 0.06, false, 'active');

-- Apuestas en Atlético Nacional (opción 2)
INSERT INTO bets (
  user_id,
  market_id,
  option_index,
  amount,
  commission_rate,
  is_premium,
  status
) VALUES
  ('4437e1fa-e501-4507-9df4-286721ecf92b', 1, 2, 35000, 0.06, false, 'active'),
  ('9d2270a3-2beb-429d-a320-a9aada38d488', 1, 2, 45000, 0.06, false, 'active'),
  ('3a727e32-ff02-465f-925c-c2c4edb7683a', 1, 2, 15000, 0.06, false, 'active');

-- =====================================================
-- VERIFICAR QUE SE INSERTARON
-- =====================================================
SELECT
  b.id,
  b.option_index,
  m.options[b.option_index + 1] as option_name,
  b.amount,
  b.commission_rate,
  b.status,
  u.email as apostador,
  b.created_at
FROM bets b
JOIN markets m ON b.market_id = m.id
LEFT JOIN auth.users u ON b.user_id = u.id
WHERE b.market_id = 1
ORDER BY b.option_index, b.created_at;

-- =====================================================
-- VER POOL STATS
-- =====================================================
SELECT
  option_index,
  COUNT(*) as num_bets,
  SUM(amount) as total_amount
FROM bets
WHERE market_id = 1 AND status = 'active'
GROUP BY option_index
ORDER BY option_index;

-- Deberías ver:
-- option_index | num_bets | total_amount
-- 0            | 3        | 100000
-- 1            | 2        | 65000
-- 2            | 3        | 95000

-- =====================================================
-- POOL TOTAL
-- =====================================================
SELECT
  COUNT(*) as total_bets,
  SUM(amount) as total_pool
FROM bets
WHERE market_id = 1 AND status = 'active';

-- Deberías ver:
-- total_bets | total_pool
-- 8          | 260000

-- =====================================================
-- VER TODAS LAS APUESTAS CON DETALLES
-- =====================================================
SELECT
  b.id,
  b.option_index,
  m.options[b.option_index + 1] as option_name,
  b.amount,
  b.commission_rate,
  b.is_premium,
  b.status,
  u.email as apostador
FROM bets b
JOIN markets m ON b.market_id = m.id
LEFT JOIN auth.users u ON b.user_id = u.id
WHERE b.market_id = 1
ORDER BY b.option_index, b.created_at;

-- =====================================================
-- VER RESUMEN POR OPCIÓN
-- =====================================================
SELECT
  b.option_index,
  m.options[b.option_index + 1] as option_name,
  COUNT(*) as num_apuestas,
  SUM(b.amount) as total_apostado,
  ROUND(AVG(b.amount), 2) as promedio_apuesta,
  ROUND(
    (SUM(b.amount)::DECIMAL /
     (SELECT SUM(amount) FROM bets WHERE market_id = 1 AND status = 'active') * 100),
    2
  ) as porcentaje_pool
FROM bets b
JOIN markets m ON b.market_id = m.id
WHERE b.market_id = 1 AND b.status = 'active'
GROUP BY b.option_index, m.options[b.option_index + 1]
ORDER BY b.option_index;

-- =====================================================
-- LIMPIAR SI NECESITAS EMPEZAR DE NUEVO
-- =====================================================
/*
DELETE FROM bets WHERE market_id = 1;
*/
