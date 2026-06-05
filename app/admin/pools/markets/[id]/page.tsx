import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Users, TrendingUp, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function MarketDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

  const { id } = await params;
  const marketId = parseInt(id);

  // Get market details
  const { data: market } = await supabaseAdmin
    .from('markets')
    .select(`
      *,
      pool_stats (*)
    `)
    .eq('id', marketId)
    .single();

  if (!market) {
    redirect('/admin/pools/markets');
  }

  // Get bets
  const { data: bets } = await supabaseAdmin
    .from('bets')
    .select(`
      *,
      user_profiles (email, full_name)
    `)
    .eq('market_id', marketId)
    .order('created_at', { ascending: false });

  // Calculate stats
  const poolStats = market.pool_stats || [];
  const totalPool = poolStats.reduce((sum: number, ps: any) => sum + Number(ps.total_amount), 0);
  const totalBets = poolStats.reduce((sum: number, ps: any) => sum + Number(ps.total_bets), 0);

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      open: 'bg-green-100 text-green-800',
      locked: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800',
    };

    return styles[status as keyof typeof styles] || styles.draft;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/pools/markets"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{market.title}</h1>
          <p className="text-gray-500 mt-1">Detalles del mercado #{market.id}</p>
        </div>
        <Badge className={getStatusBadge(market.status)}>
          {market.status}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pool Total</CardTitle>
            <DollarSign className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${totalPool.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Apuestas</CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalBets}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Opciones</CardTitle>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{market.options.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Evento</CardTitle>
            <Calendar className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-gray-900">
              {new Date(market.event_date).toLocaleDateString('es-CO', {
                day: 'numeric',
                month: 'short',
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Market Info */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Mercado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {market.description && (
            <div>
              <p className="text-sm font-medium text-gray-700">Descripción:</p>
              <p className="text-gray-600">{market.description}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Categoría:</p>
              <p className="text-gray-900">{market.category}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Límites de apuesta:</p>
              <p className="text-gray-900">
                ${market.min_bet} - ${market.max_bet} (máx ${market.max_total_bet} total)
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Abre:</p>
              <p className="text-gray-900">{formatDate(market.opens_at)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Cierra:</p>
              <p className="text-gray-900">{formatDate(market.closes_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pool Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución del Pool</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {market.options.map((option: string, index: number) => {
              const stats = poolStats.find((ps: any) => ps.option_index === index);
              const amount = stats ? Number(stats.total_amount) : 0;
              const betsCount = stats ? stats.total_bets : 0;
              const percentage = totalPool > 0 ? (amount / totalPool) * 100 : 0;

              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{option}</span>
                      {market.winning_option === index && (
                        <Badge className="bg-green-100 text-green-800">Ganador</Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${amount.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">{betsCount} apuestas</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">{percentage.toFixed(1)}% del pool</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Bets List */}
      <Card>
        <CardHeader>
          <CardTitle>Apuestas ({bets?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {bets && bets.length > 0 ? (
            <div className="space-y-3">
              {bets.map((bet: any) => (
                <div
                  key={bet.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {bet.user_profiles?.email || 'Usuario desconocido'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Apostó a: <strong>{market.options[bet.option_index]}</strong>
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(bet.created_at).toLocaleString('es-CO')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${Number(bet.amount).toFixed(2)}</p>
                    <Badge
                      className={
                        bet.status === 'won'
                          ? 'bg-green-100 text-green-800'
                          : bet.status === 'lost'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }
                    >
                      {bet.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No hay apuestas en este mercado</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
