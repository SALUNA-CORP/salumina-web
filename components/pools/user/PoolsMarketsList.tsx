'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlaceBetModal } from './PlaceBetModal';
import { FavoriteButton } from '../FavoriteButton';
import { Calendar, DollarSign, Users, TrendingUp, Clock } from 'lucide-react';
import type { MarketWithStats } from '@/types/pools';

interface PoolsMarketsListProps {
  markets: MarketWithStats[];
}

export function PoolsMarketsList({ markets }: PoolsMarketsListProps) {
  const [selectedMarket, setSelectedMarket] = useState<MarketWithStats | null>(null);

  if (markets.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-500">No hay mercados disponibles en este momento</p>
          <p className="text-sm text-gray-400 mt-1">Vuelve pronto para nuevas oportunidades</p>
        </CardContent>
      </Card>
    );
  }

  const getCategoryLabel = (category: string) => {
    const labels = {
      sports_soccer: 'Fútbol',
      sports_basketball: 'Baloncesto',
      sports_tennis: 'Tenis',
      sports_other: 'Deportes',
      politics: 'Política',
      entertainment: 'Entretenimiento',
      prediction: 'Predicción',
    };
    return labels[category as keyof typeof labels] || category;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CO', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getTimeUntilClose = (closesAt: string) => {
    const now = new Date();
    const closes = new Date(closesAt);
    const diff = closes.getTime() - now.getTime();

    if (diff < 0) return 'Cerrado';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }

    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <div className="grid gap-4">
      {markets.map((market) => {
        const isClosed = new Date(market.closes_at) <= new Date();
        const timeLeft = getTimeUntilClose(market.closes_at);

        return (
          <Card
            key={market.id}
            className={`hover:shadow-lg transition-all ${
              isClosed ? 'opacity-60' : 'hover:border-blue-500'
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{market.title}</h3>
                    <Badge variant="outline">{getCategoryLabel(market.category)}</Badge>
                  </div>
                  {market.description && (
                    <p className="text-gray-600 text-sm">{market.description}</p>
                  )}
                </div>
                <FavoriteButton marketId={market.id} />
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">Pool</p>
                    <p className="font-semibold text-gray-900">
                      ${market.total_pool.toFixed(0)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Apuestas</p>
                    <p className="font-semibold text-gray-900">{market.total_bets}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-500">Evento</p>
                    <p className="font-semibold text-gray-900 text-sm">
                      {formatDate(market.event_date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${isClosed ? 'text-red-600' : 'text-yellow-600'}`} />
                  <div>
                    <p className="text-xs text-gray-500">Cierra</p>
                    <p
                      className={`font-semibold text-sm ${
                        isClosed ? 'text-red-600' : 'text-gray-900'
                      }`}
                    >
                      {timeLeft}
                    </p>
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {market.options.map((option: string, index: number) => {
                  const odds = market.current_odds[index] || 1.0;

                  return (
                    <button
                      key={index}
                      onClick={() => !isClosed && setSelectedMarket(market)}
                      disabled={isClosed}
                      className={`text-left p-4 rounded-lg border-2 transition-all ${
                        isClosed
                          ? 'border-gray-200 cursor-not-allowed'
                          : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-gray-900 flex-1">{option}</p>
                        <Badge className="bg-blue-100 text-blue-800 text-sm font-bold">
                          {odds.toFixed(2)}x
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">
                        $1 retorna ${odds.toFixed(2)}
                      </p>
                    </button>
                  );
                })}
              </div>

              {isClosed && (
                <div className="mt-4 text-center text-sm text-red-600 font-medium">
                  Este mercado ya cerró
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Place Bet Modal */}
      {selectedMarket && (
        <PlaceBetModal
          market={selectedMarket}
          onClose={() => setSelectedMarket(null)}
          onSuccess={() => {
            setSelectedMarket(null);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
