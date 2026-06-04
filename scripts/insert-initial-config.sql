-- Insert initial commission configuration
INSERT INTO commission_config (
  direct_commission_percentage,
  min_withdrawal_usd,
  min_withdrawal_cop,
  placement_change_days,
  base_subscription_price,
  bookmaker_price
) VALUES (
  10.0,    -- 10% comisión directa
  50.0,    -- $50 USD mínimo de retiro
  150000.0, -- $150,000 COP mínimo de retiro
  7,       -- 7 días para cambiar ubicación
  20.0,    -- $20 precio base
  5.0      -- $5 por bookmaker
)
ON CONFLICT DO NOTHING;

-- Insert binary commission levels (2-20) with 0% by default
INSERT INTO binary_commission_levels (level, percentage)
VALUES
  (2, 0),
  (3, 0),
  (4, 0),
  (5, 0),
  (6, 0),
  (7, 0),
  (8, 0),
  (9, 0),
  (10, 0),
  (11, 0),
  (12, 0),
  (13, 0),
  (14, 0),
  (15, 0),
  (16, 0),
  (17, 0),
  (18, 0),
  (19, 0),
  (20, 0)
ON CONFLICT (level) DO NOTHING;
