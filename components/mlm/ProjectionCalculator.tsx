'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';

export function ProjectionCalculator() {
  const [directReferrals, setDirectReferrals] = useState(3);
  const [duplicateRate, setDuplicateRate] = useState(50); // Percentage
  const [months, setMonths] = useState(6);
  const [avgCommissionPerUser, setAvgCommissionPerUser] = useState(10);

  // Calculate projections
  const calculateProjections = () => {
    const projections = [];
    let totalNetwork = directReferrals;
    let totalIncome = 0;

    for (let month = 1; month <= months; month++) {
      // Calculate new people this month (exponential growth with duplication rate)
      const effectiveDuplicateRate = (duplicateRate / 100) * 0.7; // Reduce for realism
      const newPeople = Math.round(totalNetwork * effectiveDuplicateRate);
      totalNetwork += newPeople;

      // Calculate monthly income (commissions from network activity)
      const monthlyIncome = totalNetwork * avgCommissionPerUser * 0.3; // 30% activity rate
      totalIncome += monthlyIncome;

      projections.push({
        month,
        networkSize: totalNetwork,
        monthlyIncome: Math.round(monthlyIncome),
        cumulativeIncome: Math.round(totalIncome),
        newMembers: month === 1 ? directReferrals : newPeople,
      });
    }

    return projections;
  };

  const projections = calculateProjections();
  const finalProjection = projections[projections.length - 1];

  // Scenarios (conservative, realistic, optimistic)
  const scenarios = [
    {
      name: 'Conservador',
      color: 'bg-gray-600',
      multiplier: 0.5,
      description: 'Proyección pesimista',
    },
    {
      name: 'Realista',
      color: 'bg-blue-600',
      multiplier: 1,
      description: 'Escenario probable',
    },
    {
      name: 'Optimista',
      color: 'bg-green-600',
      multiplier: 1.5,
      description: 'Mejor escenario',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Calculadora de Proyecciones
        </h2>
        <p className="text-sm sm:text-base text-gray-500 mt-1">
          Simula el crecimiento de tu red y tus ingresos potenciales
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Parámetros de Simulación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Direct Referrals */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Referidos Directos por Mes
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={directReferrals}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val === '') return;
                  const num = Math.min(100, Math.max(1, parseInt(val) || 1));
                  setDirectReferrals(num);
                }}
                onBlur={(e) => {
                  if (e.target.value === '' || parseInt(e.target.value) < 1) {
                    setDirectReferrals(1);
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Personas que invitas directamente cada mes
              </p>
            </div>

            {/* Duplicate Rate */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Tasa de Duplicación (%)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={duplicateRate}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val === '') {
                    setDuplicateRate(0);
                    return;
                  }
                  const num = Math.min(100, parseInt(val) || 0);
                  setDuplicateRate(num);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                % de tu red que duplica tu esfuerzo
              </p>
            </div>

            {/* Months */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Proyección a Futuro (meses)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={months}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val === '') return;
                  const num = Math.min(36, Math.max(1, parseInt(val) || 1));
                  setMonths(num);
                }}
                onBlur={(e) => {
                  if (e.target.value === '' || parseInt(e.target.value) < 1) {
                    setMonths(1);
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Horizonte de tiempo para la proyección
              </p>
            </div>

            {/* Average Commission */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Comisión Promedio por Usuario ($)
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={avgCommissionPerUser}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val === '') return;
                  const num = Math.min(1000, Math.max(1, parseInt(val) || 1));
                  setAvgCommissionPerUser(num);
                }}
                onBlur={(e) => {
                  if (e.target.value === '' || parseInt(e.target.value) < 1) {
                    setAvgCommissionPerUser(1);
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ingreso promedio por usuario activo/mes
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="truncate">Red Final</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  {finalProjection?.networkSize.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 mt-1">personas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium text-gray-600 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="truncate">Ingreso Total</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-gray-900">
                  ${finalProjection?.cumulativeIncome.toLocaleString()}
                </div>
                <p className="text-xs text-gray-500 mt-1">acumulado</p>
              </CardContent>
            </Card>
          </div>

          {/* Scenarios */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Escenarios Proyectados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {scenarios.map((scenario) => {
                const scenarioIncome = Math.round(
                  (finalProjection?.cumulativeIncome || 0) * scenario.multiplier
                );
                const scenarioNetwork = Math.round(
                  (finalProjection?.networkSize || 0) * scenario.multiplier
                );

                return (
                  <div key={scenario.name} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${scenario.color}`} />
                        <span className="font-semibold text-gray-900 text-sm sm:text-base">
                          {scenario.name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{scenario.description}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <p className="text-xs text-gray-500">Red</p>
                        <p className="text-sm sm:text-base font-bold text-gray-900">
                          {scenarioNetwork.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Ingresos</p>
                        <p className="text-sm sm:text-base font-bold text-gray-900">
                          ${scenarioIncome.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Proyección Mes a Mes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 sm:px-4 text-gray-600">Mes</th>
                  <th className="text-right py-2 px-2 sm:px-4 text-gray-600">Nuevos</th>
                  <th className="text-right py-2 px-2 sm:px-4 text-gray-600">Red Total</th>
                  <th className="text-right py-2 px-2 sm:px-4 text-gray-600">Ingreso Mes</th>
                  <th className="text-right py-2 px-2 sm:px-4 text-gray-600">Acumulado</th>
                </tr>
              </thead>
              <tbody>
                {projections.map((p) => (
                  <tr key={p.month} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-2 sm:px-4 font-medium">Mes {p.month}</td>
                    <td className="py-2 px-2 sm:px-4 text-right text-blue-600">
                      +{p.newMembers}
                    </td>
                    <td className="py-2 px-2 sm:px-4 text-right font-semibold">
                      {p.networkSize.toLocaleString()}
                    </td>
                    <td className="py-2 px-2 sm:px-4 text-right text-green-600">
                      ${p.monthlyIncome.toLocaleString()}
                    </td>
                    <td className="py-2 px-2 sm:px-4 text-right font-bold">
                      ${p.cumulativeIncome.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <p className="text-xs sm:text-sm text-yellow-800">
            <strong>Nota:</strong> Esta calculadora es una herramienta de proyección estimada.
            Los resultados reales dependen de múltiples factores incluyendo tu esfuerzo, el
            mercado, y la actividad de tu red. No garantiza resultados específicos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
