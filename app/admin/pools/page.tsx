import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';
import Link from 'next/link';

export default async function AdminPoolsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user is admin
  const { data: userData } = await supabaseAdmin
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userData?.role !== 'superadmin') {
    redirect('/dashboard');
  }

  // Get statistics
  const { data: markets } = await supabaseAdmin
    .from('markets')
    .select('id, status');

  const { data: bets } = await supabaseAdmin
    .from('bets')
    .select('amount, status');

  const { data: wallets } = await supabaseAdmin
    .from('user_wallets')
    .select('balance, total_deposited, total_wagered');

  const totalMarkets = markets?.length || 0;
  const activeMarkets = markets?.filter(m => m.status === 'open' || m.status === 'locked').length || 0;
  const resolvedMarkets = markets?.filter(m => m.status === 'resolved').length || 0;

  const totalBets = bets?.length || 0;
  const totalWagered = bets?.reduce((sum, bet) => sum + Number(bet.amount), 0) || 0;

  const totalBalance = wallets?.reduce((sum, w) => sum + Number(w.balance), 0) || 0;
  const totalDeposited = wallets?.reduce((sum, w) => sum + Number(w.total_deposited), 0) || 0;

  const stats = [
    {
      title: 'Mercados Totales',
      value: totalMarkets,
      description: `${activeMarkets} activos, ${resolvedMarkets} resueltos`,
      icon: Activity,
      color: 'text-blue-600',
    },
    {
      title: 'Apuestas Totales',
      value: totalBets,
      description: `$${totalWagered.toFixed(2)} apostado`,
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      title: 'Balance en Wallets',
      value: `$${totalBalance.toFixed(2)}`,
      description: `$${totalDeposited.toFixed(2)} depositado total`,
      icon: DollarSign,
      color: 'text-yellow-600',
    },
    {
      title: 'Usuarios Activos',
      value: wallets?.filter(w => Number(w.total_wagered) > 0).length || 0,
      description: 'Han colocado apuestas',
      icon: Users,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">PolyBet Pools</h1>
          <p className="text-gray-500 mt-1">Gestión de mercados de apuestas</p>
        </div>
        <Link
          href="/admin/pools/markets/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Crear Mercado
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link
          href="/admin/pools/markets"
          className="bg-white border-2 border-gray-200 hover:border-blue-500 rounded-lg p-6 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
              <Activity className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Gestionar Mercados</h3>
              <p className="text-sm text-gray-500">Ver, editar y resolver</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/pools/markets/create"
          className="bg-white border-2 border-gray-200 hover:border-green-500 rounded-lg p-6 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-600 transition-colors">
              <TrendingUp className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Crear Mercado</h3>
              <p className="text-sm text-gray-500">Nuevo evento de apuestas</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/pools/wallets"
          className="bg-white border-2 border-gray-200 hover:border-yellow-500 rounded-lg p-6 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-600 transition-colors">
              <DollarSign className="w-6 h-6 text-yellow-600 group-hover:text-white transition-colors" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Wallets & Retiros</h3>
              <p className="text-sm text-gray-500">Gestionar fondos</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Markets Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Mercados Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>Ve a "Gestionar Mercados" para ver todos los mercados</p>
            <Link
              href="/admin/pools/markets"
              className="text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block"
            >
              Ver todos los mercados →
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
