import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CopyReferralButton } from '@/components/dashboard/CopyReferralButton';
import { DollarSign, Users, TrendingUp, Calendar } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Obtener estadísticas
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  const { data: commissions } = await supabase
    .from('commissions')
    .select('amount, status')
    .eq('user_id', user.id);

  const availableBalance = commissions
    ?.filter((c) => c.status === 'available')
    .reduce((sum, c) => sum + Number(c.amount), 0) || 0;

  const totalEarned = commissions?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;

  // Contar referidos directos
  const { count: directReferrals } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('sponsor_id', user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Bienvenido, {profile?.full_name || 'Usuario'}
        </h1>
        <p className="text-gray-500 mt-1">
          Este es tu panel de control personal
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Saldo Disponible
            </CardTitle>
            <DollarSign className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ${availableBalance.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Disponible para retiro
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Ganado
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ${totalEarned.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Comisiones totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Referidos Directos
            </CardTitle>
            <Users className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {directReferrals || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Usuarios que referiste
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Estado Suscripción
            </CardTitle>
            <Calendar className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {subscription ? 'Activa' : 'Inactiva'}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {subscription
                ? `Renueva: ${new Date(subscription.current_period_end).toLocaleDateString()}`
                : 'Sin suscripción activa'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Code Card */}
      <Card>
        <CardHeader>
          <CardTitle>Tu Código de Referido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Comparte este código para referir nuevos usuarios</p>
              <p className="text-2xl font-mono font-bold text-blue-600 mt-2">
                {profile?.referral_code}
              </p>
            </div>
            <CopyReferralButton referralCode={profile?.referral_code || ''} />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {!subscription && (
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="text-white">¡Activa tu suscripción!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Necesitas una suscripción activa para acceder a la app móvil y ganar comisiones.
            </p>
            <a
              href="/dashboard/subscription"
              className="inline-block px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Ver Planes
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
