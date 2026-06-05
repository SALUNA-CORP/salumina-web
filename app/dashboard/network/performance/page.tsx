'use client';

import { useEffect, useState } from 'react';
import { NetworkPerformanceChart } from '@/components/mlm/NetworkPerformanceChart';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface PerformanceData {
  period: string;
  newReferrals: number;
  totalCommissions: number;
  networkSize: number;
}

interface Totals {
  totalReferrals: number;
  totalCommissions: number;
  networkSize: number;
  growthRate: number;
}

export default function NetworkPerformancePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PerformanceData[]>([]);
  const [totals, setTotals] = useState<Totals>({
    totalReferrals: 0,
    totalCommissions: 0,
    networkSize: 0,
    growthRate: 0,
  });
  const [period, setPeriod] = useState<'monthly' | 'weekly'>('monthly');

  useEffect(() => {
    fetchPerformanceData();
  }, [period]);

  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/mlm/performance?period=${period}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setTotals(result.totals);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard de Performance</h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Visualiza el crecimiento de tu red
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod('weekly')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === 'weekly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Semanal
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Mensual
          </button>
        </div>
      </div>

      {/* Performance Charts */}
      <NetworkPerformanceChart data={data} totals={totals} />

      {/* Tips Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-4 sm:p-6">
          <h3 className="font-semibold text-gray-900 mb-3">💡 Tips para Mejorar tu Performance</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>
                Mantén contacto regular con tus referidos directos para motivarlos a construir su red
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>
                Comparte materiales del Training Center para ayudar a tu equipo a reclutar mejor
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>
                Enfócate en balancear ambas piernas para maximizar comisiones binarias
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>
                Celebra los logros de tu equipo - el éxito de ellos es tu éxito
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
