import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, TrendingUp, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Estadísticas de usuarios
  const { count: totalUsers } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true });

  const { count: activeUsers } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  const { count: pendingUsers } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  // Estadísticas de suscripciones
  const { count: activeSubscriptions } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  // Estadísticas de comisiones
  const { data: commissionsData } = await supabase
    .from('commissions')
    .select('amount, status');

  const totalCommissions = commissionsData?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;
  const availableCommissions = commissionsData
    ?.filter((c) => c.status === 'available')
    .reduce((sum, c) => sum + Number(c.amount), 0) || 0;

  // Estadísticas de retiros
  const { count: pendingWithdrawals } = await supabase
    .from('withdrawals')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  // Usuarios pendientes de aprobación
  const { data: pendingUsersList } = await supabase
    .from('user_profiles')
    .select('id, email, full_name, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(5);

  // Últimas suscripciones
  const { data: recentSubscriptions } = await supabase
    .from('subscriptions')
    .select('id, user_id, total_amount, created_at, user_profiles(email, full_name)')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Panel de Administrador</h1>
        <p className="text-gray-500 mt-1">Vista general del sistema</p>
      </div>

      {/* Alert: Usuarios Pendientes */}
      {pendingUsers && pendingUsers > 0 && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-orange-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-orange-800">
                Tienes {pendingUsers} {pendingUsers === 1 ? 'usuario pendiente' : 'usuarios pendientes'} de aprobación
              </p>
              <Link href="/admin/users" className="text-sm text-orange-700 underline mt-1">
                Ver usuarios pendientes →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Usuarios
            </CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalUsers || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              {activeUsers || 0} activos, {pendingUsers || 0} pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Suscripciones Activas
            </CardTitle>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {activeSubscriptions || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Usuarios con plan activo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Comisiones Totales
            </CardTitle>
            <DollarSign className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ${totalCommissions.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              ${availableCommissions.toFixed(2)} disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Retiros Pendientes
            </CardTitle>
            <AlertCircle className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {pendingWithdrawals || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Solicitudes por aprobar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usuarios Pendientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Usuarios Pendientes de Aprobación</span>
              <Link
                href="/admin/users"
                className="text-sm font-normal text-blue-600 hover:underline"
              >
                Ver todos
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingUsersList && pendingUsersList.length > 0 ? (
              <div className="space-y-3">
                {pendingUsersList.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{user.full_name || 'Sin nombre'}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-xs text-gray-400">
                        Registrado: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Revisar
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-8">
                No hay usuarios pendientes
              </p>
            )}
          </CardContent>
        </Card>

        {/* Últimas Suscripciones */}
        <Card>
          <CardHeader>
            <CardTitle>Últimas Suscripciones</CardTitle>
          </CardHeader>
          <CardContent>
            {recentSubscriptions && recentSubscriptions.length > 0 ? (
              <div className="space-y-3">
                {recentSubscriptions.map((sub: any) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {sub.user_profiles?.full_name || 'Usuario'}
                      </p>
                      <p className="text-sm text-gray-500">{sub.user_profiles?.email}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">${sub.total_amount}</p>
                      <p className="text-xs text-gray-500">mensual</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-8">
                No hay suscripciones aún
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/admin/users"
              className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors"
            >
              <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
              <p className="text-sm font-medium text-gray-900">Gestionar Usuarios</p>
            </Link>
            <Link
              href="/admin/config"
              className="p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition-colors"
            >
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-purple-600" />
              <p className="text-sm font-medium text-gray-900">Configurar Comisiones</p>
            </Link>
            <Link
              href="/admin/withdrawals"
              className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors"
            >
              <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-600" />
              <p className="text-sm font-medium text-gray-900">Aprobar Retiros</p>
            </Link>
            <Link
              href="/admin/analytics"
              className="p-4 bg-orange-50 rounded-lg text-center hover:bg-orange-100 transition-colors"
            >
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-orange-600" />
              <p className="text-sm font-medium text-gray-900">Ver Analíticas</p>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
