'use client';

import { X } from 'lucide-react';
import { Button } from './button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  loading?: boolean;
  children?: React.ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  loading = false,
  children,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col animate-fade-in">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description && (
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors ml-4"
            disabled={loading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Children Content - Scrollable */}
        {children && (
          <div className="overflow-y-auto flex-1 p-6">
            {children}
          </div>
        )}

        {/* Actions - Fixed at bottom (only if onConfirm exists) */}
        {onConfirm && (
          <div className="flex gap-3 justify-end p-6 pt-4 border-t border-gray-200 flex-shrink-0">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              {cancelText}
            </Button>
            <Button
              variant={variant === 'destructive' ? 'destructive' : 'default'}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? 'Procesando...' : confirmText}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
