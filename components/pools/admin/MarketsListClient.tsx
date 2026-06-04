'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { ResolveMarketModal } from './ResolveMarketModal';
import { Calendar, DollarSign, TrendingUp, Users, Lock, CheckCircle, XCircle } from 'lucide-react';
import type { Market } from '@/types/pools';
import Link from 'next/link';

interface MarketWithStats extends Market {
  total_pool: number;
  total_bets: number;
}

interface MarketsListClientProps {
  initialMarkets: MarketWithStats[];
}

export function MarketsListClient({ initialMarkets }: MarketsListClientProps) {
  const [markets, setMarkets] = useState(initialMarkets);
  const [selectedMarket, setSelectedMarket] = useState<MarketWithStats | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'locked' | 'resolved'>('all');
  const { showToast } = useToast();

  const filteredMarkets = markets.filter((m) => {
    if (filter === 'all') return true;
    return m.status === filter;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      open: 'bg-green-100 text-green-800',
      locked: 'bg-yellow-100 text-yellow-800',
      resolving: 'bg-blue-100 text-blue-800',
      resolved: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800',
    };

    const labels = {
      draft: 'Borrador',
      open: 'Abierto',
      locked: 'Cerrado',
      resolving: 'Resolviendo',
      resolved: 'Resuelto',
      cancelled: 'Cancelado',
    };

    return (
      <Badge className={styles[status as keyof typeof styles] || styles.draft}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      sports_soccer: 'Fútbol',
      sports_basketball: 'Baloncesto',
      sports_tennis: 'Tenis',
      sports_other: 'Otros Deportes',
      politics: 'Política',
      entertainment: 'Entretenimiento',
      prediction: 'Predicción',
    };

    return labels[category as keyof typeof labels] || category;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleResolveSuccess = () => {
    setSelectedMarket(null);
    showToast('Mercado resuelto exitosamente', 'success');
    // Refresh markets
    window.location.reload();
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todos ({markets.length})
        </button>
        <button
          onClick={() => setFilter('open')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'open'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Abiertos ({markets.filter((m) => m.status === 'open').length})
        </button>
        <button
          onClick={() => setFilter('locked')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'locked'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Cerrados ({markets.filter((m) => m.status === 'locked').length})
        </button>
        <button
          onClick={() => setFilter('resolved')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'resolved'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Resueltos ({markets.filter((m) => m.status === 'resolved').length})
        </button>
      </div>

      {/* Markets List */}
      {filteredMarkets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-500">No hay mercados en esta categoría</p>
            <Link
              href="/admin/pools/markets/create"
              className="text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block"
            >
              Crear primer mercado →
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredMarkets.map((market) => (
            <Card key={market.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {market.title}
                      </h3>
                      {getStatusBadge(market.status)}
                      <Badge variant="outline">{getCategoryLabel(market.category)}</Badge>
                    </div>
                    {market.description && (
                      <p className="text-gray-600 text-sm mb-3">{market.description}</p>
                    )}
                  </div>
                </div>

                {/* Options */}
                <div className="mb-4 bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Opciones:</p>
                  <div className="flex flex-wrap gap-2">
                    {market.options.map((option: string, index: number) => (
                      <div
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          market.winning_option === index
                            ? 'bg-green-100 text-green-800 border-2 border-green-500'
                            : 'bg-white border border-gray-300 text-gray-700'
                        }`}
                      >
                        {option}
                        {market.winning_option === index && ' ✓'}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-xs text-gray-500">Pool Total</p>
                      <p className="font-semibold text-gray-900">
                        ${market.total_pool.toFixed(2)}
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
                    <Lock className="w-4 h-4 text-yellow-600" />
                    <div>
                      <p className="text-xs text-gray-500">Cierra</p>
                      <p className="font-semibold text-gray-900 text-sm">
                        {formatDate(market.closes_at)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  {(market.status === 'locked' || market.status === 'open') && (
                    <Button
                      onClick={() => setSelectedMarket(market)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Resolver Mercado
                    </Button>
                  )}

                  {market.status === 'resolved' && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Resuelto el {formatDate(market.resolved_at || '')}
                      {market.resolution_source && (
                        <a
                          href={market.resolution_source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Ver fuente
                        </a>
                      )}
                    </div>
                  )}

                  <Link
                    href={`/admin/pools/markets/${market.id}`}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm px-4 py-2 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Ver Detalles
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Resolve Market Modal */}
      {selectedMarket && (
        <ResolveMarketModal
          market={selectedMarket}
          onClose={() => setSelectedMarket(null)}
          onSuccess={handleResolveSuccess}
        />
      )}
    </div>
  );
}
