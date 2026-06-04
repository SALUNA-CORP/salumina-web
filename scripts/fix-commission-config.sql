-- Delete any existing config (if any)
DELETE FROM commission_config;

-- Insert initial config
INSERT INTO commission_config (
  direct_commission_percentage,
  min_withdrawal_usd,
  min_withdrawal_cop,
  placement_change_days,
  base_subscription_price,
  bookmaker_price,
  created_at,
  updated_at
) VALUES (
  10.0,
  50.0,
  150000.0,
  7,
  20.0,
  5.0,
  NOW(),
  NOW()
);

-- Verify it was created
SELECT * FROM commission_config;
