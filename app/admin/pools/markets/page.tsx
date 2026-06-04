import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { MarketsListClient } from '@/components/pools/admin/MarketsListClient';

export default async function AdminMarketsPage() {
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

  // Get all markets
  const { data: markets } = await supabaseAdmin
    .from('markets')
    .select(`
      *,
      pool_stats (*)
    `)
    .order('event_date', { ascending: false });

  // Calculate stats for each market
  const marketsWithStats = markets?.map((market) => {
    const poolStats = market.pool_stats || [];
    const totalPool = poolStats.reduce((sum: number, ps: any) => sum + Number(ps.total_amount), 0);
    const totalBets = poolStats.reduce((sum: number, ps: any) => sum + Number(ps.total_bets), 0);

    return {
      ...market,
      total_pool: totalPool,
      total_bets: totalBets,
    };
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestionar Mercados</h1>
          <p className="text-gray-500 mt-1">Todos los mercados de apuestas</p>
        </div>
      </div>

      <MarketsListClient initialMarkets={marketsWithStats} />
    </div>
  );
}
