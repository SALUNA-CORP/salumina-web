'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, BellOff, Trash2, TrendingUp, DollarSign, Clock, CheckCircle } from 'lucide-react';

interface Alert {
  id: number;
  market_id: number;
  alert_type: string;
  threshold_value: number | null;
  is_active: boolean;
  triggered_at: string | null;
  created_at: string;
  markets: {
    id: number;
    title: string;
    category: string;
    status: string;
  };
}

interface AlertManagerProps {
  alerts: Alert[];
  onRefresh: () => void;
}

export function AlertManager({ alerts, onRefresh }: AlertManagerProps) {
  const [loading, setLoading] = useState<number | null>(null);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'odds_change':
        return <TrendingUp className="w-4 h-4" />;
      case 'pool_threshold':
        return <DollarSign className="w-4 h-4" />;
      case 'closing_soon':
        return <Clock className="w-4 h-4" />;
      case 'status_change':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getAlertLabel = (type: string) => {
    const labels: Record<string, string> = {
      odds_change: 'Cambio de Cuotas',
      pool_threshold: 'Umbral de Pool',
      closing_soon: 'Cierra Pronto',
      status_change: 'Cambio de Estado',
    };
    return labels[type] || type;
  };

  const getAlertDescription = (alert: Alert) => {
    switch (alert.alert_type) {
      case 'odds_change':
        return `Notificar cuando las cuotas cambien más de ${alert.threshold_value}%`;
      case 'pool_threshold':
        return `Notificar cuando el pool alcance $${alert.threshold_value?.toLocaleString()}`;
      case 'closing_soon':
        return `Notificar ${alert.threshold_value} horas antes del cierre`;
      case 'status_change':
        return 'Notificar cuando el mercado cambie de estado';
      default:
        return 'Alerta configurada';
    }
  };

  const handleToggle = async (alertId: number, currentStatus: boolean) => {
    setLoading(alertId);
    try {
      const response = await fetch('/api/pools/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alert_id: alertId,
          is_active: !currentStatus,
        }),
      });

      if (response.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error toggling alert:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (alertId: number) => {
    if (!confirm('¿Estás seguro de eliminar esta alerta?')) return;

    setLoading(alertId);
    try {
      const response = await fetch(`/api/pools/alerts?alert_id=${alertId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error deleting alert:', error);
    } finally {
      setLoading(null);
    }
  };

  if (alerts.length === 0) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Bell className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-500 text-center">No tienes alertas configuradas</p>
          <p className="text-sm text-gray-400 text-center mt-2">
            Las alertas te notificarán sobre cambios importantes en tus mercados favoritos
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <Card
          key={alert.id}
          className={`transition-all ${
            alert.is_active ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200 opacity-60'
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              {/* Alert Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`p-2 rounded-lg ${
                      alert.is_active ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {getAlertIcon(alert.alert_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      {getAlertLabel(alert.alert_type)}
                      {alert.triggered_at && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Disparada
                        </span>
                      )}
                      {!alert.is_active && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          Inactiva
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{alert.markets.title}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 ml-12">{getAlertDescription(alert)}</p>
                <div className="flex items-center gap-4 ml-12 mt-2 text-xs text-gray-400">
                  <span className="capitalize">{alert.markets.category}</span>
                  <span>•</span>
                  <span>
                    Creada{' '}
                    {new Date(alert.created_at).toLocaleDateString('es-CO', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleToggle(alert.id, alert.is_active)}
                  disabled={loading === alert.id}
                  className={`p-2 rounded-lg transition-colors ${
                    alert.is_active
                      ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={alert.is_active ? 'Desactivar alerta' : 'Activar alerta'}
                >
                  {alert.is_active ? (
                    <Bell className="w-4 h-4" />
                  ) : (
                    <BellOff className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(alert.id)}
                  disabled={loading === alert.id}
                  className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                  title="Eliminar alerta"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
