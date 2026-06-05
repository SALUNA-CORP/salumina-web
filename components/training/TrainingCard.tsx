'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { PlayCircle, FileText, Download, Clock, CheckCircle2, BookOpen } from 'lucide-react';

interface TrainingMaterial {
  id: number;
  title: string;
  description: string | null;
  content_type: string;
  category: string;
  difficulty: string;
  duration_minutes: number;
  thumbnail_url: string | null;
  user_progress: {
    is_completed: boolean;
    progress_percentage: number;
    time_spent_minutes: number;
  } | null;
}

const contentIcons = {
  video: PlayCircle,
  article: FileText,
  pdf: Download,
};

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800',
};

const difficultyLabels = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
};

const categoryLabels: Record<string, string> = {
  recruitment: 'Reclutamiento',
  sales: 'Ventas',
  platform: 'Plataforma',
  success_stories: 'Historias de Éxito',
};

export function TrainingCard({ material }: { material: TrainingMaterial }) {
  const Icon = contentIcons[material.content_type as keyof typeof contentIcons] || BookOpen;
  const isCompleted = material.user_progress?.is_completed || false;
  const progress = material.user_progress?.progress_percentage || 0;

  return (
    <Link href={`/dashboard/training/${material.id}`}>
      <Card className="h-full hover:shadow-lg transition-all cursor-pointer group">
        {/* Thumbnail */}
        <div className="relative h-40 bg-gradient-to-br from-blue-500 to-purple-500 rounded-t-lg overflow-hidden">
          {material.thumbnail_url ? (
            <img
              src={material.thumbnail_url}
              alt={material.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon className="w-16 h-16 text-white/80" />
            </div>
          )}

          {/* Completed Badge */}
          {isCompleted && (
            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-2">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}

          {/* Duration */}
          <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {material.duration_minutes} min
          </div>
        </div>

        <CardContent className="p-4">
          {/* Title */}
          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {material.title}
          </h3>

          {/* Description */}
          {material.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{material.description}</p>
          )}

          {/* Tags */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                difficultyColors[material.difficulty as keyof typeof difficultyColors]
              }`}
            >
              {difficultyLabels[material.difficulty as keyof typeof difficultyLabels]}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 capitalize">
              {categoryLabels[material.category] || material.category}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800 capitalize flex items-center gap-1">
              <Icon className="w-3 h-3" />
              {material.content_type}
            </span>
          </div>

          {/* Progress Bar */}
          {material.user_progress && progress > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Progreso</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    isCompleted ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Start Button */}
          {!material.user_progress && (
            <div className="text-center mt-2">
              <span className="text-sm text-blue-600 font-medium group-hover:underline">
                Comenzar →
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
