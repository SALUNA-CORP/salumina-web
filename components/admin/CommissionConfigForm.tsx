'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';

interface CommissionConfig {
  direct_commission_percentage: number;
  min_withdrawal_usd: number;
  min_withdrawal_cop: number;
  placement_change_days: number;
  base_subscription_price: number;
  bookmaker_price: number;
}

interface BinaryLevel {
  level: number;
  percentage: number;
}

export function CommissionConfigForm({
  config,
  levels,
}: {
  config: CommissionConfig | null;
  levels: BinaryLevel[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    direct_commission_percentage: config?.direct_commission_percentage || 10,
    min_withdrawal_usd: config?.min_withdrawal_usd || 50,
    min_withdrawal_cop: config?.min_withdrawal_cop || 150000,
    placement_change_days: config?.placement_change_days || 7,
    base_subscription_price: config?.base_subscription_price || 20,
    bookmaker_price: config?.bookmaker_price || 5,
  });

  const [binaryLevels, setBinaryLevels] = useState<{ [key: number]: number }>(() => {
    const defaultLevels: { [key: number]: number } = {};
    // Initialize levels 2-20 with 0 by default
    for (let i = 2; i <= 20; i++) {
      defaultLevels[i] = 0;
    }
    // Override with actual data if exists
    levels.forEach(level => {
      defaultLevels[level.level] = level.percentage;
    });
    return defaultLevels;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/config/commissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: formData,
          levels: Object.entries(binaryLevels).map(([level, percentage]) => ({
            level: parseInt(level),
            percentage,
          })),
        }),
      });

      const data = await response.json();

      if (data.success) {
        showToast('Configuración actualizada exitosamente', 'success');
        router.refresh();
      } else {
        showToast(data.message || 'Error al actualizar configuración', 'error');
      }
    } catch (error) {
      showToast('Error al procesar la solicitud', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General Config */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración General</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="direct_commission">Comisión Directa (%)</Label>
            <Input
              id="direct_commission"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.direct_commission_percentage}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  direct_commission_percentage: parseFloat(e.target.value),
                })
              }
              required
            />
            <p className="text-xs text-gray-500">
              Porcentaje que gana el sponsor de cada pago del referido directo
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="placement_days">Días para Cambiar Ubicación</Label>
            <Input
              id="placement_days"
              type="number"
              min="1"
              value={formData.placement_change_days}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  placement_change_days: parseInt(e.target.value),
                })
              }
              required
            />
            <p className="text-xs text-gray-500">
              Días que tiene el sponsor para cambiar la ubicación del referido
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="min_usd">Mínimo Retiro USD</Label>
            <Input
              id="min_usd"
              type="number"
              step="0.01"
              min="0"
              value={formData.min_withdrawal_usd}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  min_withdrawal_usd: parseFloat(e.target.value),
                })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="min_cop">Mínimo Retiro COP</Label>
            <Input
              id="min_cop"
              type="number"
              step="1"
              min="0"
              value={formData.min_withdrawal_cop}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  min_withdrawal_cop: parseFloat(e.target.value),
                })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="base_price">Precio Base Suscripción</Label>
            <Input
              id="base_price"
              type="number"
              step="0.01"
              min="0"
              value={formData.base_subscription_price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  base_subscription_price: parseFloat(e.target.value),
                })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bookmaker_price">Precio por Bookmaker</Label>
            <Input
              id="bookmaker_price"
              type="number"
              step="0.01"
              min="0"
              value={formData.bookmaker_price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bookmaker_price: parseFloat(e.target.value),
                })
              }
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Binary Levels */}
      <Card>
        <CardHeader>
          <CardTitle>Comisiones Binarias por Nivel (2-20)</CardTitle>
          <p className="text-sm text-gray-500 mt-2">
            Porcentaje de comisión para cada nivel de profundidad en la red binaria
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 19 }, (_, i) => i + 2).map((level) => (
              <div key={level} className="space-y-2">
                <Label htmlFor={`level-${level}`} className="text-sm">
                  Nivel {level}
                </Label>
                <div className="relative">
                  <Input
                    id={`level-${level}`}
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={binaryLevels[level] ?? 0}
                    onChange={(e) =>
                      setBinaryLevels({
                        ...binaryLevels,
                        [level]: parseFloat(e.target.value),
                      })
                    }
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    %
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading} size="lg">
          {loading ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </div>
    </form>
  );
}
