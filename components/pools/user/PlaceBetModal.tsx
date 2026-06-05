'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { DollarSign, TrendingUp, AlertCircle, Clock, Users, PieChart } from 'lucide-react';
import type { MarketWithStats } from '@/types/pools';

interface PlaceBetModalProps {
  market: MarketWithStats;
  onClose: () => void;
  onSuccess: () => void;
}

interface PoolStats {
  total_pool: number;
  option_pools: number[];
  option_bets: number[];
}

export function PlaceBetModal({ market, onClose, onSuccess }: PlaceBetModalProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState<any>(null);
  const [poolStats, setPoolStats] = useState<PoolStats | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
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

    // Fetch pool stats
    fetch(`/api/pools/markets/${market.id}/stats`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPoolStats(data.stats);
        }
      })
      .catch(console.error);
  }, [market.id]);

  // Countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      // Use betting_closes_at if available, otherwise use event_date
      const closeTime = new Date(market.betting_closes_at || market.event_date);
      const diff = closeTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Cerrado');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [market.betting_closes_at, market.event_date]);

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

  // Calculate real payout based on pool (parimutuel system)
  const calculatePayout = () => {
    if (selectedOption === null || !amount || !poolStats) {
      return { grossPayout: 0, netPayout: 0, profit: 0 };
    }

    const betAmount = parseFloat(amount);
    const totalPool = poolStats.total_pool + betAmount; // Include this bet
    const optionPool = (poolStats.option_pools[selectedOption] || 0) + betAmount;

    // Parimutuel calculation: (Total Pool / Winning Pool) * Your Bet
    // After 6% commission: Total Pool * 0.94
    const poolAfterCommission = totalPool * 0.94;
    const grossPayout = (poolAfterCommission / optionPool) * betAmount;
    const netPayout = grossPayout; // Already has commission deducted
    const profit = netPayout - betAmount;

    return {
      grossPayout,
      netPayout,
      profit,
    };
  };

  const { grossPayout, netPayout, profit } = calculatePayout();

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Colocar Apuesta"
      description={market.title}
    >
      <div className="space-y-4">
        {/* Countdown Timer */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-800">
                Cierre de apuestas en:
              </span>
            </div>
            <span className="text-lg font-bold text-red-900 font-mono">
              {timeRemaining}
            </span>
          </div>
        </div>

        {/* Wallet Balance */}
        {wallet && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-700">Balance Disponible</p>
                <p className="text-xl font-bold text-blue-900">${wallet.balance.toFixed(2)}</p>
              </div>
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        )}

        {/* Pool Info */}
        {poolStats && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <PieChart className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Pool Total</span>
            </div>
            <p className="text-2xl font-bold text-purple-900 mb-2">
              ${poolStats.total_pool.toLocaleString()}
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {market.options.map((option: string, index: number) => {
                const optionAmount = poolStats.option_pools[index] || 0;
                const percentage = poolStats.total_pool > 0
                  ? ((optionAmount / poolStats.total_pool) * 100).toFixed(1)
                  : '0.0';
                const bets = poolStats.option_bets[index] || 0;

                return (
                  <div key={index} className="bg-white rounded p-2">
                    <p className="font-medium text-gray-900 truncate">{option}</p>
                    <p className="text-purple-700 font-semibold">
                      ${optionAmount.toLocaleString()}
                    </p>
                    <p className="text-gray-500">
                      {percentage}% • {bets} apuestas
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Select Option */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecciona tu opción:
          </label>
          <div className="space-y-2">
            {market.options.map((option: string, index: number) => {
              const optionAmount = poolStats?.option_pools[index] || 0;
              const percentage = poolStats && poolStats.total_pool > 0
                ? ((optionAmount / poolStats.total_pool) * 100).toFixed(0)
                : '0';

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
                      <span className="text-xs text-gray-500">{percentage}% del pool</span>
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
              placeholder="10"
              min={market.min_bet}
              max={market.max_bet}
              step="1"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>Mínimo: ${market.min_bet}</span>
            <span>Máximo: ${market.max_bet}</span>
          </div>

          {/* Quick amounts */}
          <div className="grid grid-cols-4 gap-2 mt-2">
            {[10, 25, 50, 100].map((quickAmount) => (
              <button
                key={quickAmount}
                onClick={() => setAmount(quickAmount.toString())}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium transition-colors"
              >
                ${quickAmount}
              </button>
            ))}
          </div>
        </div>

        {/* Payout Estimate - MEJORADO */}
        {selectedOption !== null && amount && parseFloat(amount) > 0 && poolStats && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800 mb-3">
                  Si tu opción gana, recibirás:
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-lg font-bold text-green-900">
                      ${netPayout.toFixed(2)}
                    </span>
                    <span className="text-sm text-green-700">
                      Ganancia: <span className="font-semibold">+${profit.toFixed(2)}</span>
                    </span>
                  </div>

                  <div className="bg-green-100 rounded p-2 text-xs text-green-800">
                    <p className="mb-1">
                      <strong>¿Cómo se calcula?</strong>
                    </p>
                    <p>
                      Tu pago se calcula al cierre según el total del pool dividido entre
                      quienes apostaron a la opción ganadora. Mientras más personas apuesten
                      a tu opción, menor será tu ganancia (y viceversa).
                    </p>
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
            <strong>Importante:</strong> Tu ganancia final dependerá del monto total del pool
            y cuántas personas apostaron a cada opción al momento del cierre. Este cálculo es
            estimado con el pool actual.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
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
            disabled={loading || selectedOption === null || !amount || timeRemaining === 'Cerrado'}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Procesando...' : 'Confirmar Apuesta'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
