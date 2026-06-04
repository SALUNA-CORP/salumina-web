import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default async function WithdrawalsPage() {
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

  // Get withdrawals history
  const { data: withdrawals } = await supabase
    .from('withdrawals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Retiros</h1>
        <p className="text-gray-500 mt-1">Solicita retiros de tus comisiones</p>
      </div>

      {/* Balance Card */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-900">Saldo Disponible</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-4xl font-bold text-green-600">${availableBalance.toFixed(2)}</p>
              <p className="text-sm text-green-700 mt-1">Disponible para retiro</p>
            </div>
            {availableBalance >= 50 ? (
              <Link
                href="/dashboard/withdrawals/request"
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
              >
                Solicitar Retiro
              </Link>
            ) : (
              <div className="text-right">
                <p className="text-sm text-green-700">Mínimo para retiro: $50</p>
                <p className="text-xs text-green-600 mt-1">
                  Te faltan ${(50 - availableBalance).toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Withdrawals History */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Retiros</CardTitle>
        </CardHeader>
        <CardContent>
          {withdrawals && withdrawals.length > 0 ? (
            <div className="space-y-3">
              {withdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      ${Number(withdrawal.amount).toFixed(2)} {withdrawal.currency}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(withdrawal.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {withdrawal.crypto} - {withdrawal.wallet_address.slice(0, 10)}...
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    withdrawal.status === 'completed' ? 'bg-green-100 text-green-800' :
                    withdrawal.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    withdrawal.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                    withdrawal.status === 'processing' ? 'bg-purple-100 text-purple-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {withdrawal.status === 'completed' ? 'Completado' :
                     withdrawal.status === 'pending' ? 'Pendiente' :
                     withdrawal.status === 'approved' ? 'Aprobado' :
                     withdrawal.status === 'processing' ? 'Procesando' :
                     'Rechazado'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No has solicitado retiros aún</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
