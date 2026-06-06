'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { DollarSign, User, FileText, CheckCircle } from 'lucide-react';
import { formatUSD } from '@/lib/utils/currency';

export function CashRechargeForm() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    user_email: '',
    amount: '',
    notes: '',
  });
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(formData.amount);

    if (!formData.user_email || !amount || amount <= 0) {
      showToast('Email y monto válido son requeridos', 'warning');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // First, find user by email
      const userResponse = await fetch(
        `/api/admin/users/find?email=${encodeURIComponent(formData.user_email)}`
      );
      const userData = await userResponse.json();

      if (!userData.success || !userData.user) {
        showToast('Usuario no encontrado', 'error');
        setLoading(false);
        return;
      }

      // Then, recharge
      const response = await fetch('/api/admin/pools/recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userData.user.id,
          amount: amount,
          notes: formData.notes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showToast(data.message || 'Recarga exitosa', 'success');
        setResult({
          user_email: formData.user_email,
          amount: amount,
          new_balance: data.new_balance,
        });
        setFormData({ user_email: '', amount: '', notes: '' });
      } else {
        showToast(data.error || 'Error al procesar recarga', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error al procesar la solicitud', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Recarga de Efectivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* User Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Email del Usuario *
              </label>
              <input
                type="email"
                value={formData.user_email}
                onChange={(e) =>
                  setFormData({ ...formData, user_email: e.target.value })
                }
                placeholder="usuario@ejemplo.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Monto (USD) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">USD</span>
                </div>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  className="w-full pl-14 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Ingresa el monto que el usuario pagó en efectivo
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Notas (opcional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Ej: Recibido en oficina, referencia #123"
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Quick amounts */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Montos rápidos:</p>
              <div className="grid grid-cols-4 gap-2">
                {[10, 25, 50, 100].map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => setFormData({ ...formData, amount: quick.toString() })}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium transition-colors"
                  >
                    USD {quick}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Procesando...' : 'Recargar Saldo'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Success Result */}
      {result && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-green-900 mb-2">
                  ¡Recarga Exitosa!
                </h4>
                <div className="space-y-1 text-sm text-green-800">
                  <p>
                    <strong>Usuario:</strong> {result.user_email}
                  </p>
                  <p>
                    <strong>Monto recargado:</strong> {formatUSD(result.amount)}
                  </p>
                  <p>
                    <strong>Nuevo saldo:</strong> {formatUSD(result.new_balance)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
