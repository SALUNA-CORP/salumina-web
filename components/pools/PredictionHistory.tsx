'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Target, DollarSign, Award, Zap } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Bet {
  id: number;
  amount: number;
  status: string;
  net_payout: number | null;
  created_at: string;
  markets: {
    id: number;
    title: string;
    category: string;
    status: string;
  };
  market_options: {
    option_text: string;
  };
}

interface Stats {
  total: number;
  won: number;
  lost: number;
  pending: number;
  winRate: number;
  roi: number;
  totalInvested: number;
  totalReturns: number;
  netProfit: number;
  bestCategory: string;
  currentStreak: {
    count: number;
    type: 'won' | 'lost' | null;
  };
}

interface CategoryStat {
  category: string;
  total: number;
  won: number;
  lost: number;
  winRate: string;
}

interface TimeSeriesData {
  date: string;
  profit: number;
  cumulative: number;
}

interface PredictionHistoryProps {
  bets: Bet[];
  stats: Stats;
  categoriesStats: CategoryStat[];
  timeSeriesData: TimeSeriesData[];
}

export function PredictionHistory({
  bets,
  stats,
  categoriesStats,
  timeSeriesData,
}: PredictionHistoryProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      won: 'bg-green-100 text-green-800',
      lost: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
    };
    const labels = {
      won: 'Ganada',
      lost: 'Perdida',
      pending: 'Pendiente',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
              <Target className="w-4 h-4" />
              Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.winRate.toFixed(2)}%</div>
            <p className="text-xs text-gray-500">
              {stats.won} ganadas / {stats.won + stats.lost} totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              ROI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.roi >= 0 ? '+' : ''}{stats.roi.toFixed(2)}%
            </div>
            <p className="text-xs text-gray-500">Retorno de inversión</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              Ganancia Neta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(stats.netProfit)}
            </div>
            <p className="text-xs text-gray-500">De {formatCurrency(stats.totalInvested)} invertido</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
              <Zap className="w-4 h-4" />
              Racha Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.currentStreak.type === 'won' ? 'text-green-600' : 'text-red-600'}`}>
              {stats.currentStreak.count || 0}
              {stats.currentStreak.type === 'won' ? ' 🔥' : stats.currentStreak.type === 'lost' ? ' 💔' : ''}
            </div>
            <p className="text-xs text-gray-500">
              {stats.currentStreak.type === 'won' ? 'Victorias consecutivas' : stats.currentStreak.type === 'lost' ? 'Derrotas consecutivas' : 'Sin racha'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {timeSeriesData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">Ganancia Acumulada (Últimos 30 días)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    }}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => formatDate(label)}
                  />
                  <Line
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    name="Ganancia Acumulada"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Best Category */}
      {categoriesStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              Mejor Categoría: {stats.bestCategory}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {categoriesStats.map((cat) => (
                <div
                  key={cat.category}
                  className={`p-3 rounded-lg border-2 ${
                    cat.category === stats.bestCategory ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-900 capitalize">{cat.category}</div>
                  <div className="text-2xl font-bold text-blue-600 mt-1">{cat.winRate}%</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {cat.won}/{cat.total} ganadas
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bets History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm sm:text-base">Historial de Predicciones ({bets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {bets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No tienes predicciones todavía. ¡Empieza a participar en los mercados!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 font-medium text-gray-600">Fecha</th>
                    <th className="text-left py-2 px-2 font-medium text-gray-600">Mercado</th>
                    <th className="text-left py-2 px-2 font-medium text-gray-600 hidden sm:table-cell">Opción</th>
                    <th className="text-right py-2 px-2 font-medium text-gray-600">Monto</th>
                    <th className="text-right py-2 px-2 font-medium text-gray-600 hidden sm:table-cell">Retorno</th>
                    <th className="text-center py-2 px-2 font-medium text-gray-600">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {bets.map((bet) => (
                    <tr key={bet.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 text-xs text-gray-600">
                        {formatDate(bet.created_at)}
                      </td>
                      <td className="py-3 px-2">
                        <div className="font-medium text-gray-900 truncate max-w-xs">
                          {bet.markets.title}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">{bet.markets.category}</div>
                      </td>
                      <td className="py-3 px-2 text-gray-600 hidden sm:table-cell">
                        <div className="truncate max-w-xs">{bet.market_options.option_text}</div>
                      </td>
                      <td className="py-3 px-2 text-right font-medium">
                        {formatCurrency(bet.amount)}
                      </td>
                      <td className="py-3 px-2 text-right font-medium hidden sm:table-cell">
                        {bet.status === 'won' ? (
                          <span className="text-green-600">{formatCurrency(bet.net_payout || 0)}</span>
                        ) : bet.status === 'lost' ? (
                          <span className="text-red-600">-{formatCurrency(bet.amount)}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-center">{getStatusBadge(bet.status)}</td>
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
