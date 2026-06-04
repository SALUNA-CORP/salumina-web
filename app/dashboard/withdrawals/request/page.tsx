import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WithdrawalRequestForm } from '@/components/withdrawals/WithdrawalRequestForm';

export default async function RequestWithdrawalPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get available balance
  const { data: commissions } = await supabase
    .from('commissions')
    .select('amount')
    .eq('user_id', user.id)
    .eq('status', 'available');

  const availableBalance = commissions?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;

  // Get config for minimum withdrawal
  const { data: config } = await supabase
    .from('commission_config')
    .select('min_withdrawal_usd, min_withdrawal_cop')
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Solicitar Retiro</h1>
        <p className="text-gray-500 mt-1">Retira tus comisiones a tu wallet de criptomonedas</p>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700">Saldo Disponible</p>
              <p className="text-3xl font-bold text-blue-900">${availableBalance.toFixed(2)}</p>
            </div>
            <div className="text-right text-sm text-blue-700">
              <p>Mínimo: ${config?.min_withdrawal_usd || 50} USD</p>
              <p>Mínimo: ${config?.min_withdrawal_cop?.toLocaleString() || '150,000'} COP</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <WithdrawalRequestForm
        availableBalance={availableBalance}
        minUsd={config?.min_withdrawal_usd || 50}
        minCop={config?.min_withdrawal_cop || 150000}
      />
    </div>
  );
}
