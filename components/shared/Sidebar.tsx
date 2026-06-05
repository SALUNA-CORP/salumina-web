'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { Logo } from './Logo';
import {
  Home,
  CreditCard,
  Network,
  DollarSign,
  Wallet,
  Users,
  Download,
  User as UserIcon,
  BarChart3,
  Settings,
  UserCog,
  TrendingUp,
  Activity,
  Calculator,
  Star,
  Trophy,
  History,
  Bell,
  GraduationCap,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface NavSection {
  label: string;
  icon: React.ElementType;
  items: NavItem[];
  defaultOpen?: boolean;
}

interface SidebarProps {
  role: 'user' | 'superadmin';
}

// User navigation organized by sections
const userSections: (NavItem | NavSection)[] = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/notifications', label: 'Notificaciones', icon: Bell },

  // Market Pools Section
  {
    label: 'Market Pools',
    icon: TrendingUp,
    defaultOpen: true,
    items: [
      { href: '/dashboard/pools', label: 'Mercados', icon: TrendingUp },
      { href: '/dashboard/pools/favorites', label: 'Favoritos', icon: Star },
      { href: '/dashboard/pools/history', label: 'Historial', icon: History },
      { href: '/dashboard/pools/alerts', label: 'Alertas', icon: Bell },
    ],
  },

  // MLM Network Section
  {
    label: 'Network MLM',
    icon: Network,
    defaultOpen: true,
    items: [
      { href: '/dashboard/network', label: 'Red Binaria', icon: Network },
      { href: '/dashboard/network/performance', label: 'Performance', icon: Activity },
      { href: '/dashboard/network/calculator', label: 'Calculadora', icon: Calculator },
      { href: '/dashboard/training', label: 'Training', icon: GraduationCap },
      { href: '/dashboard/commissions', label: 'Comisiones', icon: DollarSign },
      { href: '/dashboard/referrals', label: 'Referidos', icon: Users },
    ],
  },

  // Account Section
  {
    label: 'Mi Cuenta',
    icon: UserIcon,
    defaultOpen: true,
    items: [
      { href: '/dashboard/achievements', label: 'Logros', icon: Trophy },
      { href: '/dashboard/subscription', label: 'Suscripción', icon: CreditCard },
      { href: '/dashboard/withdrawals', label: 'Retiros', icon: Wallet },
      { href: '/dashboard/downloads', label: 'Descargas', icon: Download },
      { href: '/dashboard/profile', label: 'Perfil', icon: UserIcon },
    ],
  },
];

const adminNavItems: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/pools', label: 'PolyBet Pools', icon: TrendingUp },
  { href: '/admin/users', label: 'Usuarios', icon: Users },
  { href: '/admin/config', label: 'Configuración', icon: Settings },
  { href: '/admin/withdrawals', label: 'Retiros', icon: Wallet },
  { href: '/admin/network', label: 'Red Global', icon: Network },
  { href: '/admin/analytics', label: 'Analíticas', icon: BarChart3 },
  { href: '/admin/downloads', label: 'Descargas', icon: Download },
];

function CollapsibleSection({
  section,
  pathname,
}: {
  section: NavSection;
  pathname: string;
}) {
  const [isOpen, setIsOpen] = useState(section.defaultOpen ?? false);
  const Icon = section.icon;

  // Check if any item in section is active
  const isAnyActive = section.items.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/')
  );

  return (
    <div className="space-y-0.5">
      {/* Section Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between px-2 md:px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors',
          isAnyActive
            ? 'bg-blue-900/50 text-white'
            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
        )}
      >
        <div className="flex items-center gap-2 md:gap-3">
          <Icon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
          <span className="truncate">{section.label}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
        )}
      </button>

      {/* Section Items */}
      {isOpen && (
        <div className="ml-4 md:ml-6 space-y-0.5">
          {section.items.map((item) => {
            const ItemIcon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
              >
                <ItemIcon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  if (role === 'superadmin') {
    return (
      <aside className="w-full md:w-64 bg-gray-900 min-h-screen">
        <div className="p-4 md:p-6">
          <div className="mb-6 md:mb-8">
            <Logo size="md" href="/admin" className="[&_span]:!text-white [&_span:last-child]:!text-gray-400" />
            <div className="mt-2 md:mt-3 flex items-center gap-2 pl-0 md:pl-2">
              <UserCog className="w-3 h-3 md:w-4 md:h-4 text-blue-400" />
              <span className="text-xs md:text-sm text-gray-400">Panel Admin</span>
            </div>
          </div>

          <nav className="space-y-0.5 md:space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  )}
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    );
  }

  // User sidebar with sections
  return (
    <aside className="w-full md:w-64 bg-gray-900 min-h-screen">
      <div className="p-4 md:p-6">
        <div className="mb-6 md:mb-8">
          <Logo size="md" href="/dashboard" className="[&_span]:!text-white [&_span:last-child]:!text-gray-400" />
          <div className="mt-2 md:mt-3 flex items-center gap-2 pl-0 md:pl-2">
            <UserIcon className="w-3 h-3 md:w-4 md:h-4 text-blue-400" />
            <span className="text-xs md:text-sm text-gray-400">Panel Usuario</span>
          </div>
        </div>

        <nav className="space-y-1">
          {userSections.map((item, index) => {
            // Check if it's a section or a single item
            if ('items' in item) {
              // It's a collapsible section
              return <CollapsibleSection key={index} section={item} pathname={pathname} />;
            } else {
              // It's a single nav item
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  )}
                >
                  <Icon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            }
          })}
        </nav>
      </div>
    </aside>
  );
}
