'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import type { MarketWithStats } from '@/types/pools';

interface PlaceBetModalProps {
  market: MarketWithStats;
  onClose: () => void;
  onSuccess: () => void;
}

export function PlaceBetModal({ market, onClose, onSuccess }: PlaceBetModalProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState<any>(null);
  const { showToast } = useToast();

  useEffect(() => {
    // Fetch wallet balance
    fetch('/api/pools/wallet/balance')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setWallet(data.wallet);
        }
      })
      .catch(console.error);
  }, []);

  const handlePlaceBet = async () => {
    if (selectedOption === null) {
      showToast('Selecciona una opción', 'warning');
      return;
    }

    const betAmount = parseFloat(amount);

    if (!betAmount || betAmount <= 0) {
      showToast('Ingresa un monto válido', 'warning');
      return;
    }

    if (betAmount < market.min_bet) {
      showToast(`Apuesta mínima: $${market.min_bet}`, 'warning');
      return;
    }

    if (betAmount > market.max_bet) {
      showToast(`Apuesta máxima: $${market.max_bet}`, 'warning');
      return;
    }

    if (wallet && betAmount > wallet.balance) {
      showToast('Saldo insuficiente', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/pools/bets/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          market_id: market.id,
          option_index: selectedOption,
          amount: betAmount,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showToast(data.message || 'Apuesta colocada exitosamente', 'success');
        onSuccess();
      } else {
        showToast(data.message || 'Error al colocar apuesta', 'error');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error placing bet:', error);
      showToast('Error al procesar la solicitud', 'error');
      setLoading(false);
    }
  };

  const estimatedPayout =
    selectedOption !== null && amount
      ? parseFloat(amount) * (market.current_odds[selectedOption] || 1)
      : 0;

  const commissionRate = 0.06; // TODO: Get from user subscription status
  const estimatedCommission = estimatedPayout * commissionRate;
  const netPayout = estimatedPayout - estimatedCommission;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Colocar Apuesta"
      description={market.title}
    >
      <div className="space-y-6">
        {/* Wallet Balance */}
        {wallet && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Balance Disponible</p>
                <p className="text-2xl font-bold text-blue-900">${wallet.balance.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        )}

        {/* Select Option */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Selecciona tu opción:
          </label>
          <div className="space-y-2">
            {market.options.map((option: string, index: number) => {
              const odds = market.current_odds[index] || 1.0;

              return (
                <button
                  key={index}
                  onClick={() => setSelectedOption(index)}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                    selectedOption === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{option}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Cuota:</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-bold text-sm">
                        {odds.toFixed(2)}x
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Monto a apostar:
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="w-5 h-5 text-gray-400" />
            </div>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min={market.min_bet}
              max={market.max_bet}
              step="0.01"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Mínimo: ${market.min_bet}</span>
            <span>Máximo: ${market.max_bet}</span>
          </div>

          {/* Quick amounts */}
          <div className="flex gap-2 mt-3">
            {[10, 25, 50, 100].map((quickAmount) => (
              <button
                key={quickAmount}
                onClick={() => setAmount(quickAmount.toString())}
                className="flex-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium transition-colors"
              >
                ${quickAmount}
              </button>
            ))}
          </div>
        </div>

        {/* Payout Estimate */}
        {selectedOption !== null && amount && parseFloat(amount) > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800 mb-2">
                  Ganancia Estimada (si ganas):
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Pago bruto:</span>
                    <span className="font-semibold text-green-900">
                      ${estimatedPayout.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">
                      Comisión ({(commissionRate * 100).toFixed(0)}%):
                    </span>
                    <span className="font-semibold text-green-900">
                      -${estimatedCommission.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-green-300">
                    <span className="font-medium text-green-800">Pago neto:</span>
                    <span className="font-bold text-green-900 text-lg">
                      ${netPayout.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-green-700">Ganancia:</span>
                    <span className="font-semibold text-green-800">
                      +${(netPayout - parseFloat(amount)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <p className="text-xs text-yellow-800">
            Las cuotas pueden cambiar hasta que el mercado cierre. Tu cuota final será calculada
            al momento del cierre.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={onClose}
            disabled={loading}
            variant="outline"
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handlePlaceBet}
            disabled={loading || selectedOption === null || !amount}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Procesando...' : 'Confirmar Apuesta'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
