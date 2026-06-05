'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertManager } from '@/components/pools/AlertManager';
import { Bell, Loader2, Plus, TrendingUp, DollarSign, Clock, CheckCircle } from 'lucide-react';

export default function AlertsPage() {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [markets, setMarkets] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    market_id: '',
    alert_type: 'odds_change',
    threshold_value: '',
  });

  useEffect(() => {
    fetchAlerts();
    fetchMarkets();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/pools/alerts');
      const data = await response.json();

      if (data.success) {
        setAlerts(data.alerts);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMarkets = async () => {
    try {
      const response = await fetch('/api/pools/markets?status=active');
      const data = await response.json();

      if (data.success) {
        setMarkets(data.markets || []);
      }
    } catch (error) {
      console.error('Error fetching markets:', error);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/pools/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          market_id: parseInt(formData.market_id),
          alert_type: formData.alert_type,
          threshold_value: formData.threshold_value ? parseFloat(formData.threshold_value) : null,
        }),
      });

      if (response.ok) {
        setShowCreateForm(false);
        setFormData({ market_id: '', alert_type: 'odds_change', threshold_value: '' });
        fetchAlerts();
      }
    } catch (error) {
      console.error('Error creating alert:', error);
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
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            Alertas de Mercados
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            Configura notificaciones personalizadas sobre tus mercados
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nueva Alerta</span>
        </button>
      </div>

      {/* Create Alert Form */}
      {showCreateForm && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">Crear Nueva Alerta</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateAlert} className="space-y-4">
              {/* Market Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mercado
                </label>
                <select
                  value={formData.market_id}
                  onChange={(e) => setFormData({ ...formData, market_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecciona un mercado</option>
                  {markets.map((market) => (
                    <option key={market.id} value={market.id}>
                      {market.title} ({market.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Alert Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Alerta
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, alert_type: 'odds_change' })}
                    className={`p-3 border-2 rounded-lg flex items-center gap-2 transition-colors ${
                      formData.alert_type === 'odds_change'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <TrendingUp className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium text-sm">Cambio de Cuotas</div>
                      <div className="text-xs text-gray-500">Cuando cambien X%</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, alert_type: 'pool_threshold' })}
                    className={`p-3 border-2 rounded-lg flex items-center gap-2 transition-colors ${
                      formData.alert_type === 'pool_threshold'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <DollarSign className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium text-sm">Umbral de Pool</div>
                      <div className="text-xs text-gray-500">Al alcanzar $X</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, alert_type: 'closing_soon' })}
                    className={`p-3 border-2 rounded-lg flex items-center gap-2 transition-colors ${
                      formData.alert_type === 'closing_soon'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Clock className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium text-sm">Cierra Pronto</div>
                      <div className="text-xs text-gray-500">X horas antes</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, alert_type: 'status_change' })}
                    className={`p-3 border-2 rounded-lg flex items-center gap-2 transition-colors ${
                      formData.alert_type === 'status_change'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CheckCircle className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium text-sm">Cambio de Estado</div>
                      <div className="text-xs text-gray-500">Abierto/Cerrado/Resuelto</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Threshold Value */}
              {formData.alert_type !== 'status_change' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {formData.alert_type === 'odds_change' && 'Cambio mínimo (%)'}
                    {formData.alert_type === 'pool_threshold' && 'Monto del pool ($)'}
                    {formData.alert_type === 'closing_soon' && 'Horas antes del cierre'}
                  </label>
                  <input
                    type="number"
                    value={formData.threshold_value}
                    onChange={(e) => setFormData({ ...formData, threshold_value: e.target.value })}
                    required
                    min="0"
                    step={formData.alert_type === 'odds_change' ? '0.1' : '1'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={
                      formData.alert_type === 'odds_change'
                        ? 'Ej: 10 (para 10%)'
                        : formData.alert_type === 'pool_threshold'
                        ? 'Ej: 1000000'
                        : 'Ej: 24'
                    }
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Crear Alerta
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm text-gray-600">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{alerts.length}</div>
            <p className="text-xs text-gray-500">Alertas configuradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm text-gray-600">Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {alerts.filter((a) => a.is_active).length}
            </div>
            <p className="text-xs text-gray-500">Monitoreando</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm text-gray-600">Disparadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {alerts.filter((a) => a.triggered_at).length}
            </div>
            <p className="text-xs text-gray-500">Este mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm text-gray-600">Inactivas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {alerts.filter((a) => !a.is_active).length}
            </div>
            <p className="text-xs text-gray-500">Pausadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <AlertManager alerts={alerts} onRefresh={fetchAlerts} />
    </div>
  );
}
