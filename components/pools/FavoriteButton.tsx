'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';

interface FavoriteButtonProps {
  marketId: number;
  initialFavorited?: boolean;
  onToggle?: (favorited: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function FavoriteButton({
  marketId,
  initialFavorited = false,
  onToggle,
  size = 'md',
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);

    try {
      if (isFavorited) {
        // Remove from favorites
        const response = await fetch(`/api/pools/favorites?market_id=${marketId}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (data.success) {
          setIsFavorited(false);
          onToggle?.(false);
        } else {
          console.error('Error removing favorite:', data.error);
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/pools/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ market_id: marketId }),
        });

        const data = await response.json();

        if (data.success) {
          setIsFavorited(true);
          onToggle?.(true);
        } else {
          if (data.error !== 'Ya está en favoritos') {
            console.error('Error adding favorite:', data.error);
          }
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const buttonSizeClasses = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2',
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`${buttonSizeClasses[size]} rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50`}
      title={isFavorited ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      <Star
        className={`${sizeClasses[size]} ${
          isFavorited
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-400 hover:text-yellow-400'
        } transition-colors`}
      />
    </button>
  );
}
