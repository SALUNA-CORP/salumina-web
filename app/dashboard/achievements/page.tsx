'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AchievementCard } from '@/components/achievements/AchievementCard';
import { Trophy, Loader2, Target, Users as UsersIcon, Star } from 'lucide-react';

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

interface Stats {
  total: number;
  unlocked: number;
  locked: number;
  percentage: number;
  byCategory: {
    pools: number;
    mlm: number;
    general: number;
  };
}

export default function AchievementsPage() {
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/achievements');
      const data = await response.json();

      if (data.success) {
        setAchievements(data.achievements);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAchievements = achievements.filter((a) => {
    if (filter === 'all') return true;
    if (filter === 'unlocked') return a.unlocked;
    if (filter === 'locked') return !a.unlocked;
    return a.category === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
          Logros y Badges
        </h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">
          Desbloquea achievements participando en la plataforma
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
              <Trophy className="w-4 h-4" />
              <span className="truncate">Total</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats?.total}</div>
            <p className="text-xs text-gray-500">Logros disponibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm text-gray-600">Desbloqueados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.unlocked}</div>
            <p className="text-xs text-gray-500">{stats?.percentage}% completo</p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm text-gray-600">Progreso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all"
                style={{ width: `${stats?.percentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats?.unlocked} de {stats?.total} logros
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todos ({achievements.length})
        </button>
        <button
          onClick={() => setFilter('unlocked')}
          className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'unlocked'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Desbloqueados ({stats?.unlocked})
        </button>
        <button
          onClick={() => setFilter('locked')}
          className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'locked'
              ? 'bg-gray-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Bloqueados ({stats?.locked})
        </button>
        <div className="w-px bg-gray-300 mx-2 hidden sm:block" />
        <button
          onClick={() => setFilter('pools')}
          className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
            filter === 'pools'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Target className="w-4 h-4" />
          Pools ({stats?.byCategory.pools})
        </button>
        <button
          onClick={() => setFilter('mlm')}
          className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
            filter === 'mlm'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <UsersIcon className="w-4 h-4" />
          MLM ({stats?.byCategory.mlm})
        </button>
        <button
          onClick={() => setFilter('general')}
          className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
            filter === 'general'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Star className="w-4 h-4" />
          General ({stats?.byCategory.general})
        </button>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {filteredAchievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Trophy className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500">No hay logros en esta categoría</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
