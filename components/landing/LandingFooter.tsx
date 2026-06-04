import { Logo } from '@/components/shared/Logo';
import Link from 'next/link';

export function LandingFooter() {
  return (
    <footer className="border-t border-gray-800 bg-gray-900/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Logo size="md" className="mb-4 [&_span]:!text-white [&_span:last-child]:!text-gray-400" />
            <p className="text-gray-400 text-sm">
              Plataforma líder en arbitraje deportivo y marketing multinivel.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">Producto</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#features" className="text-gray-400 hover:text-white transition-colors">
                  Características
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">
                  Planes
                </a>
              </li>
              <li>
                <Link href="/register" className="text-gray-400 hover:text-white transition-colors">
                  Comenzar
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Empresa</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-gray-400">Sobre Nosotros</span>
              </li>
              <li>
                <span className="text-gray-400">Contacto</span>
              </li>
              <li>
                <span className="text-gray-400">Soporte</span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-gray-400">Términos de Servicio</span>
              </li>
              <li>
                <span className="text-gray-400">Política de Privacidad</span>
              </li>
              <li>
                <span className="text-gray-400">Cookies</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} PolyBet. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
