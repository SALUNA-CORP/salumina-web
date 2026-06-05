import { TrendingUp, Calendar, DollarSign, Users } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Market {
  id: number;
  title: string;
  description: string;
  category: string;
  event_date: string;
  status: string;
  options: string[];
  total_pool: number;
  total_bets: number;
  current_odds: number[];
}

interface LandingMarketsPreviewProps {
  markets: Market[];
}

export function LandingMarketsPreview({ markets }: LandingMarketsPreviewProps) {
  if (!markets || markets.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  return (
    <section className="py-20 sm:py-32 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Mercados Activos
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Apuesta ahora en los eventos más populares
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {markets.slice(0, 6).map((market) => (
            <Card
              key={market.id}
              className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-all hover:shadow-xl"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <Badge className={getCategoryColor(market.category)}>
                    {market.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-gray-400 text-xs">
                    <Calendar className="w-3 h-3" />
                    {formatDate(market.event_date)}
                  </div>
                </div>
                <CardTitle className="text-lg text-white line-clamp-2">
                  {market.title}
                </CardTitle>
                {market.description && (
                  <p className="text-sm text-gray-400 line-clamp-2 mt-2">
                    {market.description}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Pool Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-400">
                    <DollarSign className="w-4 h-4" />
                    <span>Pool: ${market.total_pool.toFixed(0)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{market.total_bets} apuestas</span>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-2">
                  {market.options.slice(0, 3).map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-700/50 rounded text-sm"
                    >
                      <span className="text-gray-200 truncate flex-1">{option}</span>
                      <span className="text-blue-400 font-semibold ml-2">
                        {market.current_odds[index]?.toFixed(2)}x
                      </span>
                    </div>
                  ))}
                  {market.options.length > 3 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{market.options.length - 3} opciones más
                    </p>
                  )}
                </div>

                {/* CTA */}
                <Link
                  href="/register"
                  className="block w-full text-center py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Registrarse para Apostar
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All CTA */}
        <div className="text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
          >
            <TrendingUp className="w-5 h-5" />
            Ver Todos los Mercados
          </Link>
          <p className="text-gray-400 mt-4 text-sm">
            Regístrate gratis para acceder a todos los mercados y empezar a apostar
          </p>
        </div>
      </div>
    </section>
  );
}
