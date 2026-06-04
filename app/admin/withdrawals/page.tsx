import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WithdrawalActions } from '@/components/admin/WithdrawalActions';

export default async function AdminWithdrawalsPage() {
  const supabase = await createClient();

  // Get all withdrawals
  const { data: withdrawals } = await supabase
    .from('withdrawals')
    .select('*, user_profiles(email, full_name)')
    .order('created_at', { ascending: false });

  const pending = withdrawals?.filter((w) => w.status === 'pending') || [];
  const approved = withdrawals?.filter((w) => w.status === 'approved' || w.status === 'processing') || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Retiros</h1>
        <p className="text-gray-500 mt-1">Aprueba o rechaza solicitudes de retiro</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pending.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              En Proceso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{approved.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Solicitudes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{withdrawals?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Withdrawals */}
      {pending.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-600">Retiros Pendientes ({pending.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pending.map((withdrawal: any) => (
                <div
                  key={withdrawal.id}
                  className="p-4 border-2 border-orange-200 bg-orange-50 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-semibold text-gray-900">
                          {withdrawal.user_profiles?.full_name || withdrawal.user_profiles?.email}
                        </p>
                        <Badge variant="warning">Pendiente</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Monto</p>
                          <p className="font-bold text-green-600">
                            ${Number(withdrawal.amount).toFixed(2)} {withdrawal.currency}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Crypto</p>
                          <p className="font-medium">{withdrawal.crypto}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Wallet</p>
                          <code className="text-xs">{withdrawal.wallet_address.slice(0, 12)}...</code>
                        </div>
                        <div>
                          <p className="text-gray-500">Fecha</p>
                          <p className="font-medium">
                            {new Date(withdrawal.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <WithdrawalActions withdrawalId={withdrawal.id} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Withdrawals */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Retiros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Usuario</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Monto</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Crypto</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Estado</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {withdrawals?.map((withdrawal: any) => (
                  <tr key={withdrawal.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">
                        {withdrawal.user_profiles?.full_name || withdrawal.user_profiles?.email}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-green-600">
                        ${Number(withdrawal.amount).toFixed(2)}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-gray-900">{withdrawal.crypto}</p>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          withdrawal.status === 'completed'
                            ? 'success'
                            : withdrawal.status === 'pending'
                            ? 'warning'
                            : withdrawal.status === 'rejected'
                            ? 'destructive'
                            : 'default'
                        }
                      >
                        {withdrawal.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-600">
                        {new Date(withdrawal.created_at).toLocaleDateString()}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
