-- ================================================
-- SAMPLE MARKETS FOR POLYBET POOLS
-- ================================================

-- Insert sample markets
-- Note: Replace 'YOUR_ADMIN_USER_ID' with actual superadmin user_id

-- Market 1: Junior vs Atlético Nacional (Fútbol)
INSERT INTO markets (
  category,
  title,
  description,
  options,
  opens_at,
  closes_at,
  event_date,
  status,
  min_bet,
  max_bet,
  max_total_bet,
  image_url,
  created_by
) VALUES (
  'sports_soccer',
  'Junior de Barranquilla vs Atlético Nacional - Liga BetPlay',
  'Partido de la jornada 15 de la Liga BetPlay. Estadio Metropolitano Roberto Meléndez, Barranquilla.',
  '["Junior de Barranquilla", "Empate", "Atlético Nacional"]',
  '2026-06-05 10:00:00-05', -- Opens 3 days before (adjust timezone as needed)
  '2026-06-08 19:30:00-05', -- Closes 30 min before match
  '2026-06-08 20:00:00-05', -- Match starts Monday June 8, 2026 at 8:00 PM
  'open',
  1.00,
  100.00,
  500.00,
  NULL,
  (SELECT id FROM users WHERE role = 'superadmin' LIMIT 1)
);

-- Market 2: Elecciones Presidenciales Colombia 2026
INSERT INTO markets (
  category,
  title,
  description,
  options,
  opens_at,
  closes_at,
  event_date,
  status,
  min_bet,
  max_bet,
  max_total_bet,
  image_url,
  created_by
) VALUES (
  'politics',
  'Elecciones Presidenciales Colombia 2026 - Primera Vuelta',
  '¿Quién ganará la primera vuelta de las elecciones presidenciales de Colombia 2026?',
  '["Gustavo Petro (reelección)", "Federico Gutiérrez", "Sergio Fajardo", "Otro candidato"]',
  '2026-06-01 00:00:00-05', -- Opens 20 days before
  '2026-06-21 07:00:00-05', -- Closes when polls open
  '2026-06-21 18:00:00-05', -- Polls close at 6 PM
  'open',
  1.00,
  100.00,
  500.00,
  NULL,
  (SELECT id FROM users WHERE role = 'superadmin' LIMIT 1)
);

-- Market 3: Bitcoin alcanza $100,000 USD en 2026 (Predicción)
INSERT INTO markets (
  category,
  title,
  description,
  options,
  opens_at,
  closes_at,
  event_date,
  status,
  min_bet,
  max_bet,
  max_total_bet,
  image_url,
  created_by
) VALUES (
  'prediction',
  '¿Bitcoin alcanzará $100,000 USD en 2026?',
  'Predicción sobre si el precio de Bitcoin (BTC/USD) alcanzará o superará los $100,000 dólares en algún momento durante el año 2026. Se verificará con datos de CoinMarketCap.',
  '["Sí, alcanzará $100K", "No, se quedará bajo $100K"]',
  NOW(), -- Opens immediately
  '2026-12-31 23:59:00-05', -- Closes last day of 2026
  '2026-12-31 23:59:59-05', -- Resolves end of 2026
  'open',
  1.00,
  100.00,
  500.00,
  NULL,
  (SELECT id FROM users WHERE role = 'superadmin' LIMIT 1)
);

-- Market 4: Colombia clasifica al Mundial 2026 (Deportes - Predicción)
INSERT INTO markets (
  category,
  title,
  description,
  options,
  opens_at,
  closes_at,
  event_date,
  status,
  min_bet,
  max_bet,
  max_total_bet,
  image_url,
  created_by
) VALUES (
  'sports_soccer',
  '¿Colombia clasificará directamente al Mundial 2026?',
  'Predicción sobre si la Selección Colombia clasificará al Mundial 2026 (Estados Unidos, México, Canadá) en posición directa (top 6 de Sudamérica). No incluye repechaje.',
  '["Sí, clasificación directa", "No, irá a repechaje o quedará fuera"]',
  NOW(), -- Opens immediately
  '2026-09-15 23:59:00-05', -- Closes when qualifiers end
  '2026-09-15 23:59:59-05', -- End of qualifiers
  'open',
  1.00,
  100.00,
  500.00,
  NULL,
  (SELECT id FROM users WHERE role = 'superadmin' LIMIT 1)
);

-- Market 5: Ganador Copa América 2024 (Ejemplo de mercado cerrado para demo)
INSERT INTO markets (
  category,
  title,
  description,
  options,
  opens_at,
  closes_at,
  event_date,
  status,
  winning_option,
  resolution_source,
  resolved_by,
  resolved_at,
  min_bet,
  max_bet,
  max_total_bet,
  created_by
) VALUES (
  'sports_soccer',
  'Ganador Copa América 2024 (Ejemplo Resuelto)',
  'Ejemplo de mercado ya resuelto para demostración del sistema.',
  '["Argentina", "Brasil", "Uruguay", "Colombia"]',
  '2024-06-15 00:00:00-05',
  '2024-07-14 19:00:00-05',
  '2024-07-14 21:00:00-05',
  'resolved',
  0, -- Argentina won (index 0)
  'https://www.conmebol.com/es/copa-america-2024-argentina-campeon',
  (SELECT id FROM users WHERE role = 'superadmin' LIMIT 1),
  '2024-07-14 23:30:00-05',
  1.00,
  100.00,
  500.00,
  (SELECT id FROM users WHERE role = 'superadmin' LIMIT 1)
);

-- Comments
COMMENT ON TABLE markets IS 'Sample markets for PolyBet Pools demonstration';

-- Note: To add these markets, run this migration after deploying the main schema (010_polybet_pools_system.sql)
-- Make sure you have at least one superadmin user in your users table before running this migration
