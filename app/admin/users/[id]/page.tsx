import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Mail, Calendar, Network, CreditCard } from 'lucide-react';
import { ApproveUserButton, RejectUserButton } from '@/components/admin/UserActions';

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: user } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (!user) {
    redirect('/admin/users');
  }

  // Get sponsor info
  const { data: sponsor } = await supabase
    .from('user_profiles')
    .select('email, full_name, referral_code')
    .eq('id', user.sponsor_id)
    .single();

  // Get active subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*, subscription_bookmakers(bookmaker_id, bookmakers(name))')
    .eq('user_id', id)
    .eq('status', 'active')
    .single();

  // Get direct referrals count
  const { count: referralsCount } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('sponsor_id', id);

  // Get commissions
  const { data: commissions } = await supabase
    .from('commissions')
    .select('amount, status')
    .eq('user_id', id);

  const totalCommissions = commissions?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;
  const availableBalance = commissions
    ?.filter((c) => c.status === 'available')
    .reduce((sum, c) => sum + Number(c.amount), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {user.full_name || 'Usuario sin nombre'}
          </h1>
          <p className="text-gray-500 mt-1">{user.email}</p>
        </div>
        <Badge
          variant={
            user.status === 'approved'
              ? 'success'
              : user.status === 'pending'
              ? 'warning'
              : 'destructive'
          }
        >
          {user.status === 'approved'
            ? 'Activo'
            : user.status === 'pending'
            ? 'Pendiente'
            : 'Inactivo'}
        </Badge>
      </div>

      {/* Actions for pending users */}
      {user.status === 'pending' && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-orange-900">Usuario pendiente de aprobación</p>
                <p className="text-sm text-orange-700 mt-1">
                  Este usuario está esperando tu aprobación para activar su cuenta
                </p>
              </div>
              <div className="flex gap-3">
                <ApproveUserButton userId={user.id} />
                <RejectUserButton userId={user.id} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Nombre completo</p>
              <p className="font-medium text-gray-900">{user.full_name || 'No especificado'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Rol</p>
              <Badge variant={user.role === 'superadmin' ? 'default' : 'secondary'}>
                {user.role === 'superadmin' ? 'Administrador' : 'Usuario'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Código de Referido</p>
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">{user.referral_code}</code>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha de Registro</p>
              <p className="font-medium text-gray-900">
                {new Date(user.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Network Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="w-5 h-5" />
              Red MLM
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Referido por (Sponsor)</p>
              {sponsor ? (
                <div>
                  <p className="font-medium text-gray-900">{sponsor.full_name || sponsor.email}</p>
                  <code className="text-xs text-gray-500">{sponsor.referral_code}</code>
                </div>
              ) : (
                <p className="text-gray-400">Sin sponsor</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500">Pierna en Red Binaria</p>
              <p className="font-medium text-gray-900">
                {user.leg ? (user.leg === 'left' ? 'Izquierda' : 'Derecha') : 'No asignada'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Referidos Directos</p>
              <p className="text-2xl font-bold text-blue-600">{referralsCount || 0}</p>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Suscripción
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {subscription ? (
              <>
                <div>
                  <p className="text-sm text-gray-500">Estado</p>
                  <Badge variant="success">Activa</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Monto Mensual</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${subscription.total_amount} {subscription.currency}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Próximo Cobro</p>
                  <p className="font-medium text-gray-900">
                    {new Date(subscription.current_period_end).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Bookmakers</p>
                  <div className="flex flex-wrap gap-1">
                    {subscription.subscription_bookmakers?.map((sb: any) => (
                      <span
                        key={sb.bookmaker_id}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                      >
                        {sb.bookmakers.name}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-gray-500 text-center py-4">Sin suscripción activa</p>
            )}
          </CardContent>
        </Card>

        {/* Commissions Info */}
        <Card>
          <CardHeader>
            <CardTitle>Comisiones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Total Ganado</p>
              <p className="text-2xl font-bold text-purple-600">${totalCommissions.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Saldo Disponible</p>
              <p className="text-2xl font-bold text-green-600">${availableBalance.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones de Administrador</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link href={`/admin/network?userId=${user.id}`}>
              <Button variant="outline">Ver Red Binaria</Button>
            </Link>
            {user.status === 'approved' && (
              <Link href={`/admin/users/${user.id}/deactivate`}>
                <Button variant="outline">Desactivar Usuario</Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
