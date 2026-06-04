import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CommissionConfigForm } from '@/components/admin/CommissionConfigForm';

export default async function CommissionsConfigPage() {
  const supabase = await createClient();

  // Verify admin access
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Use admin client to bypass RLS
  const { data: config, error: configError } = await supabaseAdmin
    .from('commission_config')
    .select('*')
    .maybeSingle(); // maybeSingle() instead of single() to handle empty table

  // Get binary levels with admin client
  const { data: levelsData } = await supabaseAdmin
    .from('binary_commission_levels')
    .select('*')
    .order('level');

  // Provide default values if no data exists
  const defaultConfig = {
    direct_commission_percentage: 10,
    min_withdrawal_usd: 50,
    min_withdrawal_cop: 150000,
    placement_change_days: 7,
    base_subscription_price: 20,
    bookmaker_price: 5,
  };

  // Convert Supabase strings to numbers
  const configWithNumbers = config ? {
    direct_commission_percentage: Number(config.direct_commission_percentage),
    min_withdrawal_usd: Number(config.min_withdrawal_usd),
    min_withdrawal_cop: Number(config.min_withdrawal_cop),
    placement_change_days: Number(config.placement_change_days),
    base_subscription_price: Number(config.base_subscription_price),
    bookmaker_price: Number(config.bookmaker_price),
  } : defaultConfig;

  const levels = (levelsData || []).map(level => ({
    level: Number(level.level),
    percentage: Number(level.percentage),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración de Comisiones</h1>
        <p className="text-gray-500 mt-1">
          Ajusta los porcentajes de comisiones y parámetros del sistema
        </p>
      </div>

      <CommissionConfigForm config={configWithNumbers} levels={levels} />
    </div>
  );
}
