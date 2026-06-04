'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';

export function WithdrawalRequestForm({
  availableBalance,
  minUsd,
  minCop,
}: {
  availableBalance: number;
  minUsd: number;
  minCop: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD' as 'USD' | 'COP',
    crypto: 'USDT' as 'USDT' | 'USDC',
    walletAddress: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(formData.amount);
    const minAmount = formData.currency === 'USD' ? minUsd : minCop;

    if (amount < minAmount) {
      showToast(`El monto mínimo de retiro es $${minAmount} ${formData.currency}`, 'warning');
      return;
    }

    if (amount > availableBalance) {
      showToast('No tienes saldo suficiente', 'error');
      return;
    }

    if (!formData.walletAddress || formData.walletAddress.length < 20) {
      showToast('Ingresa una dirección de wallet válida', 'warning');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/withdrawals/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        showToast('Solicitud de retiro enviada exitosamente', 'success');
        router.push('/dashboard/withdrawals');
      } else {
        showToast(data.message || 'Error al solicitar retiro', 'error');
      }
    } catch (error) {
      showToast('Error al procesar la solicitud', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Datos del Retiro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="amount">Monto a Retirar</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
              <p className="text-xs text-gray-500">
                Disponible: ${availableBalance.toFixed(2)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Moneda</Label>
              <select
                id="currency"
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value as 'USD' | 'COP' })
                }
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                required
              >
                <option value="USD">USD (Dólares)</option>
                <option value="COP">COP (Pesos Colombianos)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="crypto">Criptomoneda</Label>
              <select
                id="crypto"
                value={formData.crypto}
                onChange={(e) =>
                  setFormData({ ...formData, crypto: e.target.value as 'USDT' | 'USDC' })
                }
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                required
              >
                <option value="USDT">USDT (Tether)</option>
                <option value="USDC">USDC (USD Coin)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wallet">Dirección de Wallet</Label>
              <Input
                id="wallet"
                type="text"
                placeholder="0x..."
                value={formData.walletAddress}
                onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                required
              />
              <p className="text-xs text-gray-500">
                Wallet {formData.crypto} (verifica que sea correcta)
              </p>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Importante:</strong> Verifica que la dirección de wallet sea correcta. Los
              retiros son irreversibles. El proceso puede tomar 24-48 horas.
            </p>
          </div>

          <Button type="submit" disabled={loading} size="lg" className="w-full">
            {loading ? 'Enviando solicitud...' : 'Solicitar Retiro'}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
