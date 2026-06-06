import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { PoolsMarketsList } from '@/components/pools/user/PoolsMarketsList';
import { WalletOverview } from '@/components/pools/user/WalletOverview';
import Link from 'next/link';

export default async function PoolsDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user wallet
  const { data: wallet } = await supabaseAdmin
    .from('user_wallets')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Get open markets
  const { data: markets } = await supabaseAdmin
    .from('markets')
    .select(`
      *,
      pool_stats (*)
    `)
    .in('status', ['open', 'locked'])
    .order('event_date', { ascending: true })
    .limit(10);

  // Calculate stats
  const marketsWithStats = markets?.map((market) => {
    const poolStats = market.pool_stats || [];
    const totalPool = poolStats.reduce((sum: number, ps: any) => sum + Number(ps.total_amount), 0);
    const totalBets = poolStats.reduce((sum: number, ps: any) => sum + Number(ps.total_bets), 0);

    // Calculate odds
    const currentOdds = market.options.map((_: string, index: number) => {
      const optionPool = poolStats.find((ps: any) => ps.option_index === index);
      const optionAmount = optionPool ? Number(optionPool.total_amount) : 0;

      if (totalPool === 0 || optionAmount === 0) {
        return 1.0;
      }

      const odds = totalPool / optionAmount;
      return Math.max(1.01, parseFloat(odds.toFixed(2)));
    });

    return {
      ...market,
      total_pool: totalPool,
      total_bets: totalBets,
      current_odds: currentOdds,
    };
  }) || [];

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Market Pools</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">Participa en mercados de predicción</p>
      </div>

      {/* Wallet Overview */}
      <WalletOverview wallet={wallet} />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <Link
          href="/dashboard/pools/wallet"
          className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="font-semibold text-base sm:text-lg mb-1">💳 Mi Wallet</h3>
          <p className="text-blue-100 text-xs sm:text-sm">Depositar, retirar y ver transacciones</p>
        </Link>

        <Link
          href="/dashboard/pools/history"
          className="bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow"
        >
          <h3 className="font-semibold text-base sm:text-lg mb-1">📊 Mis Participaciones</h3>
          <p className="text-purple-100 text-xs sm:text-sm">Historial y mercados activos</p>
        </Link>

        <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-lg p-4 sm:p-6 sm:col-span-2 md:col-span-1">
          <h3 className="font-semibold text-base sm:text-lg mb-1">🎯 Todos los Mercados</h3>
          <p className="text-green-100 text-xs sm:text-sm">Explora todas las opciones abajo</p>
        </div>
      </div>

      {/* Markets List */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Mercados Disponibles</h2>
          <span className="text-gray-500 text-sm">
            {marketsWithStats.length} mercados disponibles
          </span>
        </div>

        <PoolsMarketsList markets={marketsWithStats} />
      </div>
    </div>
  );
}
