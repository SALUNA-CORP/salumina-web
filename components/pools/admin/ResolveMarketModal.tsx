'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { AlertCircle, CheckCircle } from 'lucide-react';
import type { Market } from '@/types/pools';

interface ResolveMarketModalProps {
  market: Market & { total_pool: number; total_bets: number };
  onClose: () => void;
  onSuccess: () => void;
}

export function ResolveMarketModal({ market, onClose, onSuccess }: ResolveMarketModalProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [resolutionSource, setResolutionSource] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleResolve = async () => {
    if (selectedOption === null) {
      showToast('Selecciona la opción ganadora', 'warning');
      return;
    }

    if (!resolutionSource.trim()) {
      showToast('Ingresa la fuente de resolución', 'warning');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/pools/markets/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          market_id: market.id,
          winning_option: selectedOption,
          resolution_source: resolutionSource,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showToast(data.message || 'Mercado resuelto exitosamente', 'success');
        onSuccess();
      } else {
        showToast(data.message || 'Error al resolver mercado', 'error');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error resolving market:', error);
      showToast('Error al procesar la solicitud', 'error');
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Resolver Mercado"
      description="Selecciona la opción ganadora y agrega la fuente oficial"
    >
      <div className="space-y-6">
        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800">
              Esta acción es irreversible
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              Se procesarán los pagos automáticamente y se acreditarán las ganancias a los
              usuarios ganadores.
            </p>
          </div>
        </div>

        {/* Market Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">{market.title}</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Pool Total</p>
              <p className="font-semibold text-gray-900">${market.total_pool.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-500">Apuestas</p>
              <p className="font-semibold text-gray-900">{market.total_bets}</p>
            </div>
          </div>
        </div>

        {/* Select Winner */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Selecciona la opción ganadora:
          </label>
          <div className="space-y-2">
            {market.options.map((option: string, index: number) => (
              <button
                key={index}
                onClick={() => setSelectedOption(index)}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                  selectedOption === index
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{option}</span>
                  {selectedOption === index && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Resolution Source */}
        <div>
          <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-2">
            Fuente de Resolución (URL o descripción):
          </label>
          <input
            id="source"
            type="text"
            value={resolutionSource}
            onChange={(e) => setResolutionSource(e.target.value)}
            placeholder="https://ejemplo.com/resultado o descripción oficial"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            URL oficial del resultado o descripción de la fuente verificable
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
            onClick={handleResolve}
            disabled={loading || selectedOption === null}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Resolviendo...' : 'Confirmar y Resolver'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
