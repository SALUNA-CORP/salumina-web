'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FavoriteButton } from '@/components/pools/FavoriteButton';
import { Star, Loader2, Calendar, DollarSign, Users } from 'lucide-react';
import Link from 'next/link';

interface Market {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  event_date: string;
  options: string[];
  total_pool: number;
  total_bets: number;
  current_odds: number[];
  favorite_id: number;
}

export default function FavoritesPage() {
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Market[]>([]);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/pools/favorites');
      const data = await response.json();

      if (data.success) {
        setFavorites(data.favorites);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = (marketId: number, favorited: boolean) => {
    if (!favorited) {
      // Remove from list
      setFavorites(favorites.filter((m) => m.id !== marketId));
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      sports: 'bg-green-100 text-green-800',
      politics: 'bg-blue-100 text-blue-800',
      entertainment: 'bg-purple-100 text-purple-800',
      economics: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category.toLowerCase()] || colors.other;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      open: 'bg-green-100 text-green-800',
      locked: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return styles[status] || styles.draft;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Star className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 fill-yellow-400" />
          Mis Favoritos
        </h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">
          Mercados que has guardado para seguimiento rápido
        </p>
      </div>

      {/* Content */}
      {favorites.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
            <Star className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              No tienes favoritos aún
            </h3>
            <p className="text-sm sm:text-base text-gray-500 text-center max-w-md mb-6">
              Agrega mercados a favoritos haciendo clic en la estrella para acceder rápidamente a
              ellos
            </p>
            <Link
              href="/dashboard/pools"
              className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              Explorar Mercados
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {favorites.map((market) => (
            <Card
              key={market.id}
              className="hover:shadow-lg transition-shadow border-2 hover:border-blue-300"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <Badge className={getCategoryColor(market.category)}>
                    {market.category}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusBadge(market.status)}>{market.status}</Badge>
                    <FavoriteButton
                      marketId={market.id}
                      initialFavorited={true}
                      onToggle={(favorited) => handleFavoriteToggle(market.id, favorited)}
                    />
                  </div>
                </div>
                <CardTitle className="text-base sm:text-lg line-clamp-2">
                  {market.title}
                </CardTitle>
                {market.description && (
                  <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 mt-2">
                    {market.description}
                  </p>
                )}
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Stats */}
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>${market.total_pool.toFixed(0)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{market.total_bets}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs">
                      {new Date(market.event_date).toLocaleDateString('es-CO', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Options Preview */}
                <div className="space-y-2">
                  {market.options.slice(0, 2).map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs sm:text-sm"
                    >
                      <span className="truncate flex-1">{option}</span>
                      <span className="text-blue-600 font-semibold ml-2">
                        {market.current_odds[index]?.toFixed(2)}x
                      </span>
                    </div>
                  ))}
                  {market.options.length > 2 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{market.options.length - 2} opciones más
                    </p>
                  )}
                </div>

                {/* Action Button */}
                <button
                  onClick={() => setSelectedMarket(market)}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  Apostar Ahora
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
