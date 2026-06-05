'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrainingCard } from '@/components/training/TrainingCard';
import { BookOpen, Loader2, CheckCircle2, Clock, GraduationCap } from 'lucide-react';

export default function TrainingPage() {
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/training');
      const data = await response.json();

      if (data.success) {
        setMaterials(data.materials);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMaterials = materials.filter((m) => {
    if (categoryFilter !== 'all' && m.category !== categoryFilter) return false;
    if (difficultyFilter !== 'all' && m.difficulty !== difficultyFilter) return false;
    return true;
  });

  const completedCount = materials.filter((m) => m.user_progress?.is_completed).length;
  const inProgressCount = materials.filter(
    (m) => m.user_progress && !m.user_progress.is_completed
  ).length;
  const totalMinutes = materials.reduce((sum, m) => sum + (m.user_progress?.time_spent_minutes || 0), 0);

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
          <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
          Training Center
        </h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">
          Aprende técnicas y estrategias para maximizar tu red MLM
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{materials.length}</div>
            <p className="text-xs text-gray-500">Materiales disponibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Completados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
            <p className="text-xs text-gray-500">
              {materials.length > 0 ? ((completedCount / materials.length) * 100).toFixed(0) : 0}% del total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm text-gray-600">En Progreso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgressCount}</div>
            <p className="text-xs text-gray-500">Sin terminar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Tiempo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{totalMinutes}</div>
            <p className="text-xs text-gray-500">Minutos estudiados</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              categoryFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas las categorías
          </button>
          <button
            onClick={() => setCategoryFilter('recruitment')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              categoryFilter === 'recruitment'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Reclutamiento
          </button>
          <button
            onClick={() => setCategoryFilter('sales')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              categoryFilter === 'sales'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Ventas
          </button>
          <button
            onClick={() => setCategoryFilter('platform')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              categoryFilter === 'platform'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Plataforma
          </button>
        </div>

        <div className="w-px bg-gray-300 mx-2 hidden sm:block" />

        <div className="flex gap-2">
          <button
            onClick={() => setDifficultyFilter('all')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              difficultyFilter === 'all'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos los niveles
          </button>
          <button
            onClick={() => setDifficultyFilter('beginner')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              difficultyFilter === 'beginner'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Principiante
          </button>
          <button
            onClick={() => setDifficultyFilter('intermediate')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              difficultyFilter === 'intermediate'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Intermedio
          </button>
          <button
            onClick={() => setDifficultyFilter('advanced')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              difficultyFilter === 'advanced'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Avanzado
          </button>
        </div>
      </div>

      {/* Materials Grid */}
      {filteredMaterials.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500">No hay materiales disponibles</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredMaterials.map((material) => (
            <TrainingCard key={material.id} material={material} />
          ))}
        </div>
      )}
    </div>
  );
}
