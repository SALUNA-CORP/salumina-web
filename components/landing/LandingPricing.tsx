import Link from 'next/link';
import { Check } from 'lucide-react';

interface LandingPricingProps {
  basePrice: number;
  bookmakerPrice: number;
  totalBookmakers: number;
}

export function LandingPricing({
  basePrice,
  bookmakerPrice,
  totalBookmakers,
}: LandingPricingProps) {
  const plans = [
    {
      name: 'Inicial',
      bookmakers: 2,
      price: basePrice + bookmakerPrice * 2,
      features: [
        '2 casas de apuestas',
        'Escaneo cada 5 min',
        'Calculadora de arbitraje',
        'Soporte por email',
        'Red MLM binaria',
        'Comisiones directas',
      ],
    },
    {
      name: 'Estándar',
      bookmakers: 3,
      price: basePrice + bookmakerPrice * 3,
      features: [
        '3 casas de apuestas',
        'Escaneo cada 2 min',
        'Calculadora avanzada',
        'Soporte prioritario',
        'Red MLM binaria',
        'Comisiones directas + binarias',
      ],
      highlighted: true,
    },
    {
      name: 'Premium',
      bookmakers: totalBookmakers,
      price: basePrice + bookmakerPrice * totalBookmakers,
      features: [
        `Todas (${totalBookmakers}) las casas`,
        'Escaneo en tiempo real',
        'Máximo potencial de arbitraje',
        'Soporte 24/7',
        'Red MLM completa',
        'Comisiones máximas',
      ],
    },
  ];

  return (
    <section id="pricing" className="py-20 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4">
            Planes que se Adaptan a Ti
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            <span className="text-blue-400 font-semibold">Activación: ${basePrice}</span> + <span className="text-green-400 font-semibold">${bookmakerPrice} por casa de apuestas</span>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Mínimo 2 casas de apuestas para arbitraje
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-8 ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-blue-600 to-blue-700 transform scale-105 shadow-2xl shadow-blue-500/50'
                  : 'bg-gray-800/50 border border-gray-700'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-green-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                    MÁS POPULAR
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-2xl font-bold mb-2 ${plan.highlighted ? 'text-white' : 'text-white'}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className={`text-5xl font-bold ${plan.highlighted ? 'text-white' : 'text-white'}`}>
                    ${plan.price}
                  </span>
                  <span className={`${plan.highlighted ? 'text-blue-100' : 'text-gray-400'}`}>
                    /mes
                  </span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      plan.highlighted ? 'text-blue-100' : 'text-blue-400'
                    }`} />
                    <span className={`text-sm ${plan.highlighted ? 'text-blue-50' : 'text-gray-300'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={`block w-full text-center py-3 rounded-lg font-semibold transition-all ${
                  plan.highlighted
                    ? 'bg-white text-blue-600 hover:bg-blue-50'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Comenzar Ahora
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-400 mt-12 text-sm">
          Precios actualizados desde la configuración del sistema • Todos los planes incluyen acceso completo al sistema MLM
        </p>
      </div>
    </section>
  );
}
