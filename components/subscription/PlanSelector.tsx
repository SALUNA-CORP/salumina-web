'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { Check } from 'lucide-react';

interface Bookmaker {
  id: number;
  name: string;
  slug: string;
  price: number;
  is_active: boolean;
}

interface PlanSelectorProps {
  bookmakers: Bookmaker[];
  currentBookmakers?: number[];
}

export function PlanSelector({ bookmakers, currentBookmakers = [] }: PlanSelectorProps) {
  const [selectedBookmakers, setSelectedBookmakers] = useState<number[]>(currentBookmakers);
  const [currency, setCurrency] = useState<'USD' | 'COP'>('USD');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const basePrice = 20;
  const bookmakerPrice = 5;
  const totalPrice = basePrice + (selectedBookmakers.length * bookmakerPrice);

  const toggleBookmaker = (id: number) => {
    setSelectedBookmakers((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const handleSubscribe = async () => {
    if (selectedBookmakers.length === 0) {
      showToast('Debes seleccionar al menos una casa de apuestas', 'warning');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookmakerIds: selectedBookmakers,
          currency,
        }),
      });

      const data = await response.json();

      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        showToast(data.message || 'Error al crear la suscripción', 'error');
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      showToast('Error al procesar la solicitud', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Currency Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Selecciona tu moneda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setCurrency('USD')}
              className={`p-4 border-2 rounded-lg transition-all ${
                currency === 'USD'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="font-semibold text-gray-900">USD ($)</p>
              <p className="text-sm text-gray-500">Dólares</p>
            </button>
            <button
              onClick={() => setCurrency('COP')}
              className={`p-4 border-2 rounded-lg transition-all ${
                currency === 'COP'
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="font-semibold text-gray-900">COP ($)</p>
              <p className="text-sm text-gray-500">Pesos Colombianos</p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Bookmakers Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Selecciona las casas de apuestas</CardTitle>
          <p className="text-sm text-gray-500 mt-2">
            Precio base: ${basePrice} + ${bookmakerPrice} por cada casa
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookmakers
              .filter((b) => b.is_active)
              .map((bookmaker) => (
                <button
                  key={bookmaker.id}
                  onClick={() => toggleBookmaker(bookmaker.id)}
                  className={`p-4 border-2 rounded-lg transition-all text-left ${
                    selectedBookmakers.includes(bookmaker.id)
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{bookmaker.name}</p>
                      <p className="text-sm text-gray-500">+${bookmaker.price}/mes</p>
                    </div>
                    {selectedBookmakers.includes(bookmaker.id) && (
                      <Check className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                </button>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Price Summary */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600">Precio base</p>
              <p className="text-lg font-semibold text-gray-900">${basePrice}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                {selectedBookmakers.length} {selectedBookmakers.length === 1 ? 'casa' : 'casas'}
              </p>
              <p className="text-lg font-semibold text-gray-900">
                ${selectedBookmakers.length * bookmakerPrice}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total mensual</p>
              <p className="text-2xl font-bold text-blue-600">
                {currency === 'USD' ? '$' : '$'}{totalPrice} {currency}
              </p>
            </div>
          </div>

          <Button
            onClick={handleSubscribe}
            disabled={loading || selectedBookmakers.length === 0}
            className="w-full"
            size="lg"
          >
            {loading ? 'Procesando...' : 'Suscribirse Ahora'}
          </Button>

          <p className="text-xs text-gray-500 text-center mt-3">
            Serás redirigido a Stripe para completar el pago
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
