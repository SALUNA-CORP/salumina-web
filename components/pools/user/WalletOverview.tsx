'use client';

import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import Link from 'next/link';
import type { UserWallet } from '@/types/pools';

interface WalletOverviewProps {
  wallet: UserWallet | null;
}

export function WalletOverview({ wallet }: WalletOverviewProps) {
  if (!wallet) {
    return (
      <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <CardContent className="p-6">
          <div className="text-center">
            <Wallet className="w-12 h-12 mx-auto mb-3 opacity-80" />
            <h3 className="text-lg font-semibold mb-2">Wallet no encontrado</h3>
            <p className="text-blue-100 text-sm mb-4">
              Hubo un problema al cargar tu wallet
            </p>
            <Link
              href="/dashboard/pools/wallet"
              className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors inline-block"
            >
              Ir a Wallet
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const balance = Number(wallet.balance);
  const totalDeposited = Number(wallet.total_deposited);
  const totalWagered = Number(wallet.total_wagered);
  const totalWon = Number(wallet.total_won);
  const netProfit = totalWon - totalWagered;

  return (
    <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-blue-100 text-sm mb-1">Balance Disponible</p>
            <h2 className="text-4xl font-bold">${balance.toFixed(2)}</h2>
          </div>
          <Wallet className="w-12 h-12 opacity-80" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4" />
              <p className="text-xs text-blue-100">Depositado</p>
            </div>
            <p className="font-semibold">${totalDeposited.toFixed(2)}</p>
          </div>

          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4" />
              <p className="text-xs text-blue-100">Apostado</p>
            </div>
            <p className="font-semibold">${totalWagered.toFixed(2)}</p>
          </div>

          <div className="bg-white/10 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4" />
              <p className="text-xs text-blue-100">Ganado</p>
            </div>
            <p className="font-semibold">${totalWon.toFixed(2)}</p>
          </div>

          <div className={`rounded-lg p-3 ${netProfit >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
            <div className="flex items-center gap-2 mb-1">
              {netProfit >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <p className="text-xs text-blue-100">Ganancia Neta</p>
            </div>
            <p className="font-semibold">
              {netProfit >= 0 ? '+' : ''}${netProfit.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Link
            href="/dashboard/pools/wallet"
            className="flex-1 bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors text-center"
          >
            Depositar
          </Link>
          <Link
            href="/dashboard/pools/wallet?tab=withdraw"
            className="flex-1 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg font-medium transition-colors text-center"
          >
            Retirar
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
