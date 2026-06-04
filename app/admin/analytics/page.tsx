import { supabaseAdmin } from '@/lib/supabase/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, TrendingUp, Calendar, UserCheck, UserX, Clock } from 'lucide-react';

export default async function AnalyticsPage() {
  // Get all users stats
  const { data: allUsers } = await supabaseAdmin
    .from('user_profiles')
    .select('id, status, created_at');

  const totalUsers = allUsers?.length || 0;
  const activeUsers = allUsers?.filter(u => u.status === 'approved').length || 0;
  const pendingUsers = allUsers?.filter(u => u.status === 'pending').length || 0;
  const rejectedUsers = allUsers?.filter(u => u.status === 'rejected').length || 0;

  // Users in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newUsersLast30Days = allUsers?.filter(
    u => new Date(u.created_at) >= thirtyDaysAgo
  ).length || 0;

  // Get subscriptions stats
  const { data: subscriptions } = await supabaseAdmin
    .from('subscriptions')
    .select('id, status, monthly_price');

  const activeSubscriptions = subscriptions?.filter(s => s.status === 'active').length || 0;
  const monthlyRevenue = subscriptions
    ?.filter(s => s.status === 'active')
    .reduce((sum, s) => sum + Number(s.monthly_price || 0), 0) || 0;

  // Get commissions stats
  const { data: commissions } = await supabaseAdmin
    .from('commissions')
    .select('amount, status, type');

  const totalCommissionsPaid = commissions
    ?.filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + Number(c.amount), 0) || 0;

  const totalCommissionsAvailable = commissions
    ?.filter(c => c.status === 'available')
    .reduce((sum, c) => sum + Number(c.amount), 0) || 0;

  const directCommissions = commissions?.filter(c => c.type === 'direct').length || 0;
  const binaryCommissions = commissions?.filter(c => c.type === 'binary').length || 0;

  // Get withdrawals stats
  const { data: withdrawals } = await supabaseAdmin
    .from('withdrawals')
    .select('status, amount');

  const pendingWithdrawals = withdrawals?.filter(w => w.status === 'pending').length || 0;
  const approvedWithdrawals = withdrawals?.filter(w => w.status === 'approved').length || 0;
  const totalWithdrawn = withdrawals
    ?.filter(w => w.status === 'approved')
    .reduce((sum, w) => sum + Number(w.amount), 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analíticas del Sistema</h1>
        <p className="text-gray-500 mt-1">
          Vista general de métricas y estadísticas
        </p>
      </div>

      {/* Users Stats */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Usuarios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Usuarios
              </CardTitle>
              <Users className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{totalUsers}</div>
              <p className="text-xs text-gray-500 mt-1">
                Registrados en el sistema
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Usuarios Activos
              </CardTitle>
              <UserCheck className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{activeUsers}</div>
              <p className="text-xs text-gray-500 mt-1">
                Aprobados y operativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Usuarios Pendientes
              </CardTitle>
              <Clock className="w-4 h-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{pendingUsers}</div>
              <p className="text-xs text-gray-500 mt-1">
                Esperando aprobación
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Nuevos (30 días)
              </CardTitle>
              <Calendar className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{newUsersLast30Days}</div>
              <p className="text-xs text-gray-500 mt-1">
                Últimos 30 días
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Revenue Stats */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Ingresos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Suscripciones Activas
              </CardTitle>
              <Users className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{activeSubscriptions}</div>
              <p className="text-xs text-gray-500 mt-1">
                Pagos recurrentes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Ingresos Mensuales
              </CardTitle>
              <DollarSign className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                ${monthlyRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Proyección mensual
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Ingresos Anuales
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                ${(monthlyRevenue * 12).toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Proyección anual
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Commissions Stats */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Comisiones</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Comisiones Directas
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{directCommissions}</div>
              <p className="text-xs text-gray-500 mt-1">
                Por referidos directos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Comisiones Binarias
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{binaryCommissions}</div>
              <p className="text-xs text-gray-500 mt-1">
                Por red binaria
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Comisiones Pagadas
              </CardTitle>
              <DollarSign className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                ${totalCommissionsPaid.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Total retirado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Comisiones Disponibles
              </CardTitle>
              <DollarSign className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                ${totalCommissionsAvailable.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Pendientes de retiro
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Withdrawals Stats */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Retiros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Retiros Pendientes
              </CardTitle>
              <Clock className="w-4 h-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{pendingWithdrawals}</div>
              <p className="text-xs text-gray-500 mt-1">
                Esperando aprobación
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Retiros Aprobados
              </CardTitle>
              <UserCheck className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{approvedWithdrawals}</div>
              <p className="text-xs text-gray-500 mt-1">
                Procesados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Retirado
              </CardTitle>
              <DollarSign className="w-4 h-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                ${totalWithdrawn.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Histórico
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Resumen Financiero</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Ingresos mensuales proyectados:</span>
            <span className="font-bold text-green-600">${monthlyRevenue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Comisiones pagadas:</span>
            <span className="font-bold text-red-600">-${totalCommissionsPaid.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Comisiones pendientes:</span>
            <span className="font-bold text-yellow-600">-${totalCommissionsAvailable.toFixed(2)}</span>
          </div>
          <div className="border-t border-blue-300 my-2"></div>
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Ganancia neta mensual:</span>
            <span className="text-2xl font-bold text-blue-900">
              ${(monthlyRevenue - totalCommissionsPaid).toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
