-- =====================================================
-- MIGRACIÓN: Agregar campo betting_closes_at
-- =====================================================
-- Permite al admin configurar cuándo se cierran las apuestas
-- (diferente de cuándo sucede el evento)
-- =====================================================

-- Agregar columna betting_closes_at
ALTER TABLE markets
ADD COLUMN betting_closes_at TIMESTAMP WITH TIME ZONE;

-- Por defecto, usar event_date para mercados existentes
UPDATE markets
SET betting_closes_at = event_date
WHERE betting_closes_at IS NULL;

-- Agregar comentario
COMMENT ON COLUMN markets.betting_closes_at IS
'Fecha y hora en que se cierra la aceptación de apuestas. Útil para eventos en vivo donde no se puede apostar durante el evento.';

-- =====================================================
-- VERIFICAR
-- =====================================================
-- SELECT id, title, event_date, betting_closes_at FROM markets LIMIT 5;

-- =====================================================
-- EJEMPLO DE USO AL CREAR MERCADO
-- =====================================================
/*
INSERT INTO markets (
  title,
  description,
  category,
  options,
  event_date,
  betting_closes_at,  -- NUEVO CAMPO
  min_bet,
  max_bet,
  status,
  created_by
) VALUES (
  'Colombia vs Argentina - Copa América 2026',
  '¿Quién ganará el partido?',
  'sports',
  ARRAY['Colombia', 'Empate', 'Argentina'],
  '2026-07-15 20:00:00-05',  -- El partido es a las 8 PM
  '2026-07-15 19:45:00-05',  -- Apuestas cierran 15 min antes
  1,
  100,
  'open',
  'user-uuid-here'
);
*/

-- =====================================================
-- ROLLBACK (Si necesitas revertir)
-- =====================================================
/*
ALTER TABLE markets DROP COLUMN betting_closes_at;
*/
