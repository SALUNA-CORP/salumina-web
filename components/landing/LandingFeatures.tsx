import { Zap, TrendingUp, Shield, Users, Calculator, RefreshCw, Target, DollarSign } from 'lucide-react';

export function LandingFeatures() {
  const features = [
    {
      icon: Target,
      title: 'Market Pools',
      description: 'Apuesta en eventos deportivos, políticos y predicciones con sistema parimutuel.',
    },
    {
      icon: Zap,
      title: 'Escaneo en Tiempo Real',
      description: 'Detección automática de arbitrajes cada 2 minutos en múltiples bookmakers.',
    },
    {
      icon: DollarSign,
      title: 'Wallet Integrado',
      description: 'Deposita, retira y gestiona tus fondos de forma segura con múltiples métodos de pago.',
    },
    {
      icon: TrendingUp,
      title: 'Sistema MLM Binario',
      description: 'Red binaria de 20 niveles con comisiones directas y residuales automáticas.',
    },
    {
      icon: Calculator,
      title: 'Calculadora de Arbitraje',
      description: 'Calcula stakes óptimos automáticamente para maximizar ganancias.',
    },
    {
      icon: Shield,
      title: 'Seguro y Confiable',
      description: 'Datos cifrados, pagos con Stripe, base de datos segura con Supabase.',
    },
  ];

  return (
    <section id="features" className="py-20 sm:py-32 bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">
            Todo lo que Necesitas
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Plataforma completa para arbitraje deportivo y construcción de red MLM
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-blue-500/50 transition-all hover:transform hover:scale-105"
            >
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                <feature.icon className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
