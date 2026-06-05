'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ArrowLeft, CheckCircle2, Play, Clock, BookOpen } from 'lucide-react';

export default function TrainingMaterialPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [material, setMaterial] = useState<any>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    fetchMaterial();
  }, []);

  useEffect(() => {
    // Track time spent
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000 / 60)); // in minutes
    }, 60000); // every minute

    return () => clearInterval(interval);
  }, [startTime]);

  const fetchMaterial = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/training');
      const data = await response.json();

      if (data.success) {
        const found = data.materials.find((m: any) => m.id === parseInt(params.id as string));
        setMaterial(found);
      }
    } catch (error) {
      console.error('Error fetching material:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      await fetch(`/api/training/${params.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          progress_percentage: 100,
          time_spent_minutes: timeSpent + (material?.user_progress?.time_spent_minutes || 0),
          is_completed: true,
        }),
      });

      // Refresh material
      fetchMaterial();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleUpdateProgress = async (percentage: number) => {
    try {
      await fetch(`/api/training/${params.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          progress_percentage: percentage,
          time_spent_minutes: timeSpent + (material?.user_progress?.time_spent_minutes || 0),
          is_completed: percentage === 100,
        }),
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!material) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Material no encontrado</p>
      </div>
    );
  }

  const isCompleted = material.user_progress?.is_completed || false;

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => router.push('/dashboard/training')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a Training Center</span>
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{material.title}</h1>
          {material.description && (
            <p className="text-gray-600 mt-2">{material.description}</p>
          )}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {material.duration_minutes} minutos
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 capitalize">
              {material.category}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 capitalize">
              {material.difficulty}
            </span>
          </div>
        </div>

        {isCompleted && (
          <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">Completado</span>
          </div>
        )}
      </div>

      {/* Progress */}
      {material.user_progress && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Tu Progreso</span>
              <span className="text-sm text-gray-600">
                {material.user_progress.progress_percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  isCompleted ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: `${material.user_progress.progress_percentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>{material.user_progress.time_spent_minutes + timeSpent} minutos estudiados</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      <Card>
        <CardContent className="p-6">
          {/* Video */}
          {material.content_type === 'video' && material.content_url && (
            <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4">
              <iframe
                src={material.content_url}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Article Text */}
          {material.content_type === 'article' && material.content_text && (
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: material.content_text }} />
            </div>
          )}

          {/* PDF */}
          {material.content_type === 'pdf' && material.content_url && (
            <div>
              <a
                href={material.content_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-fit"
              >
                <BookOpen className="w-5 h-5" />
                Abrir PDF
              </a>
            </div>
          )}

          {/* Placeholder if no content */}
          {!material.content_url && !material.content_text && (
            <div className="text-center py-12 text-gray-500">
              <Play className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Contenido no disponible</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        {!isCompleted && (
          <>
            <button
              onClick={() => handleUpdateProgress(50)}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Marcar 50% Completado
            </button>
            <button
              onClick={handleComplete}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              Marcar como Completado
            </button>
          </>
        )}

        {isCompleted && (
          <button
            onClick={() => router.push('/dashboard/training')}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Volver al Training Center
          </button>
        )}
      </div>
    </div>
  );
}
