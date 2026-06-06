'use client';

import { useEffect, useState } from 'react';
import { CashRechargeForm } from '@/components/admin/CashRechargeForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, TrendingUp, Clock } from 'lucide-react';
import { formatUSD } from '@/lib/utils/currency';

export default function AdminRechargesPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total_amount: 0,
    total_count: 0,
    today_amount: 0,
    today_count: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecharges();
  }, []);

  const fetchRecharges = async () => {
    try {
      const response = await fetch('/api/admin/pools/recharge');
      const data = await response.json();

      if (data.success) {
        setTransactions(data.transactions || []);

        // Calculate stats
        const today = new Date().toISOString().split('T')[0];
        const todayTxs = data.transactions.filter((tx: any) =>
          tx.created_at.startsWith(today)
        );

        setStats({
          total_amount: data.transactions.reduce(
            (sum: number, tx: any) => sum + (tx.amount || 0),
            0
          ),
          total_count: data.transactions.length,
          today_amount: todayTxs.reduce(
            (sum: number, tx: any) => sum + (tx.amount || 0),
            0
          ),
          today_count: todayTxs.length,
        });
      }
    } catch (error) {
      console.error('Error fetching recharges:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Recargas de Efectivo</h1>
        <p className="text-gray-500 mt-1">
          Administra recargas manuales de saldo para usuarios
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Recargado</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatUSD(stats.total_amount, false)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Recargas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_count}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Hoy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatUSD(stats.today_amount, false)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Recargas Hoy</p>
                <p className="text-2xl font-bold text-gray-900">{stats.today_count}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recharge Form */}
      <CashRechargeForm />

      {/* Recent Recharges */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Recargas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-500 py-8">Cargando...</p>
          ) : transactions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No hay recargas registradas
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Fecha</th>
                    <th className="text-left py-3 px-4">Usuario</th>
                    <th className="text-right py-3 px-4">Monto</th>
                    <th className="text-left py-3 px-4">Notas</th>
                    <th className="text-left py-3 px-4">Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {new Date(tx.created_at).toLocaleString('es-CO', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{tx.user_profiles?.email}</p>
                          {tx.user_profiles?.full_name && (
                            <p className="text-xs text-gray-500">
                              {tx.user_profiles.full_name}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-green-600">
                        {formatUSD(tx.amount)}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {tx.payment_metadata?.notes || '-'}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500">
                        {tx.payment_metadata?.admin_email || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
