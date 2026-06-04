'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/shared/Logo';
import { ArrowRight, Sparkles } from 'lucide-react';

export function LandingHero() {
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    // Handle password reset redirect
    const hash = window.location.hash;
    if (hash.includes('access_token') && hash.includes('type=recovery')) {
      window.location.href = `/reset-password${hash}`;
      return;
    }

    // Capture referral code from URL
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setReferralCode(ref);
      localStorage.setItem('referralCode', ref);
    }
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Header */}
      <header className="relative z-10 border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Logo size="md" href="/" className="[&_span]:!text-white [&_span:last-child]:!text-gray-400" />

            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-400 hover:text-white transition-colors">
                Características
              </a>
              <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">
                Planes
              </a>
              <Link
                href="/login"
                className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105"
              >
                Registrarse
              </Link>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Link
                href="/login"
                className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                Entrar
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-radial from-blue-900/20 via-transparent to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 text-sm font-medium">
                Scanner de Arbitrajes en Tiempo Real
              </span>
            </div>

            {/* Main heading */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Gana con Arbitraje
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-green-400 text-transparent bg-clip-text">
                Deportivo + MLM
              </span>
            </h1>

            {/* Description */}
            <p className="text-xl text-gray-400 mb-10 max-w-3xl mx-auto">
              Accede al scanner exclusivo de arbitrajes deportivos y construye tu red de ingresos pasivos.
              Sistema binario con comisiones automáticas.
            </p>

            {/* Referral code banner */}
            {referralCode && (
              <div className="mb-8 max-w-md mx-auto">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <p className="text-green-400 text-sm">
                    🎁 Invitado por: <span className="font-mono font-bold">{referralCode}</span>
                  </p>
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/register"
                className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-blue-500/50 flex items-center gap-2"
              >
                Comenzar Ahora
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#pricing"
                className="border border-gray-700 hover:border-gray-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all"
              >
                Ver Planes
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { label: 'Usuarios Activos', value: '1,000+' },
                { label: 'Comisiones Pagadas', value: '$50K+' },
                { label: 'Casas de Apuestas', value: '3+' },
                { label: 'ROI Promedio', value: '15%' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
