import { TrendingUp, DollarSign, Users, Shield } from 'lucide-react';
import Link from 'next/link';

export function LandingPoolsShowcase() {
  return (
    <section className="py-20 sm:py-32 bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-6xl font-bold text-white mb-4">
            PolyBet Pools
          </h2>
          <p className="text-xl sm:text-2xl text-blue-200 max-w-3xl mx-auto">
            Sistema de apuestas parimutuel en eventos deportivos, políticos y predicciones del mundo real
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Main Feature */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 md:col-span-2">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3">
                  Apuesta en Mercados de Predicción
                </h3>
                <p className="text-blue-100 text-lg mb-4">
                  Participa en pools de apuestas sobre eventos deportivos, resultados políticos,
                  predicciones económicas y más. Cuota parimutuel dinámica basada en la distribución real del pool.
                </p>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-blue-300 text-sm mb-1">Comisión Free</p>
                    <p className="text-white text-2xl font-bold">6%</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-blue-300 text-sm mb-1">Comisión Premium</p>
                    <p className="text-white text-2xl font-bold">3%</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-blue-300 text-sm mb-1">Depósito Mínimo</p>
                    <p className="text-white text-2xl font-bold">$10</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sub Features */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Wallet Integrado</h3>
            <p className="text-blue-100">
              Deposita con Stripe, PayPal o transferencia bancaria. Retira tus ganancias de forma segura y rápida.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Mercados Diversos</h3>
            <p className="text-blue-100">
              Deportes, política, entretenimiento, economía y más. Nuevos mercados agregados semanalmente.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 md:col-span-2">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Transparente y Justo</h3>
            <p className="text-blue-100">
              Sistema parimutuel 100% transparente. Las cuotas se calculan automáticamente según la distribución
              del pool. No hay casa que gane, solo comisión fija sobre ganancias.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-blue-900 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-colors shadow-xl"
          >
            <TrendingUp className="w-5 h-5" />
            Comenzar a Apostar Ahora
          </Link>
          <p className="text-blue-200 mt-4 text-sm">
            Registro gratuito • Depósito desde $10 • Comienza en menos de 2 minutos
          </p>
        </div>
      </div>
    </section>
  );
}
