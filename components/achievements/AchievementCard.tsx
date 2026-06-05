'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Lock } from 'lucide-react';

interface Achievement {
  id: number;
  code: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  category: string;
  unlocked: boolean;
  unlocked_at?: string;
}

const rarityColors = {
  common: 'from-gray-400 to-gray-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-yellow-600',
};

const rarityBorders = {
  common: 'border-gray-300',
  rare: 'border-blue-300',
  epic: 'border-purple-300',
  legendary: 'border-yellow-300',
};

export function AchievementCard({ achievement }: { achievement: Achievement }) {
  const isLocked = !achievement.unlocked;

  return (
    <Card
      className={`relative overflow-hidden transition-all ${
        isLocked ? 'opacity-60 grayscale' : 'hover:shadow-lg'
      } ${rarityBorders[achievement.rarity as keyof typeof rarityBorders]}`}
    >
      {/* Rarity gradient bar */}
      <div
        className={`h-1 bg-gradient-to-r ${
          rarityColors[achievement.rarity as keyof typeof rarityColors]
        }`}
      />

      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
                isLocked ? 'bg-gray-200' : `bg-gradient-to-br ${rarityColors[achievement.rarity as keyof typeof rarityColors]}`
              }`}
            >
              {isLocked ? <Lock className="w-6 h-6 text-gray-500" /> : achievement.icon}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className={`font-bold text-lg ${isLocked ? 'text-gray-600' : 'text-gray-900'}`}>
                {isLocked ? '???' : achievement.name}
              </h3>
              <span
                className={`text-xs px-2 py-1 rounded-full capitalize ${
                  isLocked
                    ? 'bg-gray-200 text-gray-600'
                    : 'bg-gradient-to-r text-white ' +
                      rarityColors[achievement.rarity as keyof typeof rarityColors]
                }`}
              >
                {achievement.rarity}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-2">
              {isLocked ? 'Logro bloqueado. Sigue participando para desbloquearlo.' : achievement.description}
            </p>

            {achievement.unlocked && achievement.unlocked_at && (
              <p className="text-xs text-gray-500">
                Desbloqueado:{' '}
                {new Date(achievement.unlocked_at).toLocaleDateString('es-CO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
