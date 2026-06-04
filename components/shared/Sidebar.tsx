'use client';

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
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface SidebarProps {
  role: 'user' | 'superadmin';
}

const userNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/subscription', label: 'Suscripción', icon: CreditCard },
  { href: '/dashboard/network', label: 'Red Binaria', icon: Network },
  { href: '/dashboard/commissions', label: 'Comisiones', icon: DollarSign },
  { href: '/dashboard/withdrawals', label: 'Retiros', icon: Wallet },
  { href: '/dashboard/referrals', label: 'Referidos', icon: Users },
  { href: '/dashboard/downloads', label: 'Descargas', icon: Download },
  { href: '/dashboard/profile', label: 'Perfil', icon: UserIcon },
];

const adminNavItems: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/users', label: 'Usuarios', icon: Users },
  { href: '/admin/config', label: 'Configuración', icon: Settings },
  { href: '/admin/withdrawals', label: 'Retiros', icon: Wallet },
  { href: '/admin/network', label: 'Red Global', icon: Network },
  { href: '/admin/analytics', label: 'Analíticas', icon: BarChart3 },
];

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const navItems = role === 'superadmin' ? adminNavItems : userNavItems;

  return (
    <aside className="w-64 bg-gray-900 min-h-screen">
      <div className="p-6">
        <div className="mb-8">
          <Logo size="md" href={role === 'superadmin' ? '/admin' : '/dashboard'} className="[&_span]:!text-white [&_span:last-child]:!text-gray-400" />
          <div className="mt-3 flex items-center gap-2 pl-2">
            {role === 'superadmin' ? (
              <UserCog className="w-4 h-4 text-blue-400" />
            ) : (
              <UserIcon className="w-4 h-4 text-blue-400" />
            )}
            <span className="text-sm text-gray-400">
              {role === 'superadmin' ? 'Panel Admin' : 'Panel Usuario'}
            </span>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
