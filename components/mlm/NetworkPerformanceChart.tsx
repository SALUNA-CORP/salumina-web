'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users, DollarSign } from 'lucide-react';

interface PerformanceData {
  period: string;
  newReferrals: number;
  totalCommissions: number;
  networkSize: number;
}

interface NetworkPerformanceChartProps {
  data: PerformanceData[];
  totals: {
    totalReferrals: number;
    totalCommissions: number;
    networkSize: number;
    growthRate: number;
  };
}

export function NetworkPerformanceChart({ data, totals }: NetworkPerformanceChartProps) {
  // Calculate max values for chart scaling
  const maxReferrals = Math.max(...data.map(d => d.newReferrals), 1);
  const maxCommissions = Math.max(...data.map(d => d.totalCommissions), 1);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="truncate">Referidos Directos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">
              {totals.totalReferrals}
            </div>
            <p className="text-xs text-gray-500 mt-1">Total acumulado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="truncate">Comisiones</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">
              ${totals.totalCommissions.toFixed(0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Últimos 90 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span className="truncate">Red Total</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">
              {totals.networkSize}
            </div>
            <p className="text-xs text-gray-500 mt-1">Personas en tu red</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center gap-2">
              {totals.growthRate >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span className="truncate">Crecimiento</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-xl sm:text-2xl font-bold ${totals.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totals.growthRate >= 0 ? '+' : ''}{totals.growthRate}%
            </div>
            <p className="text-xs text-gray-500 mt-1">Últimos 30 días</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Referrals Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Nuevos Referidos por Período</CardTitle>
            <p className="text-xs sm:text-sm text-gray-500">Últimos 12 períodos</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">{item.period}</span>
                    <span className="font-semibold text-gray-900">{item.newReferrals}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(item.newReferrals / maxReferrals) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Commissions Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Comisiones por Período</CardTitle>
            <p className="text-xs sm:text-sm text-gray-500">Últimos 12 períodos</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">{item.period}</span>
                    <span className="font-semibold text-gray-900">${item.totalCommissions.toFixed(0)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${(item.totalCommissions / maxCommissions) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Network Health Indicator */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Estado de tu Red</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Actividad de Red</span>
                <span className="text-sm font-semibold text-gray-900">
                  {totals.growthRate > 10 ? 'Excelente' : totals.growthRate > 0 ? 'Buena' : 'Mejorable'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    totals.growthRate > 10
                      ? 'bg-green-600'
                      : totals.growthRate > 0
                      ? 'bg-blue-600'
                      : 'bg-yellow-600'
                  }`}
                  style={{ width: `${Math.min(Math.max(totals.growthRate * 5, 0), 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Promedio Referidos/Mes</p>
                <p className="text-lg font-bold text-gray-900">
                  {(data.reduce((sum, d) => sum + d.newReferrals, 0) / data.length).toFixed(1)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Promedio Comisiones/Mes</p>
                <p className="text-lg font-bold text-gray-900">
                  ${(data.reduce((sum, d) => sum + d.totalCommissions, 0) / data.length).toFixed(0)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Mejor Mes</p>
                <p className="text-lg font-bold text-gray-900">
                  ${Math.max(...data.map(d => d.totalCommissions)).toFixed(0)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
