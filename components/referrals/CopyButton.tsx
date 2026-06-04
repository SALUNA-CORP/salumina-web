'use client';

import { Copy } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export function CopyButton({ text, label = 'copiado' }: { text: string; label?: string }) {
  const { showToast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    showToast(`${label} al portapapeles`, 'success');
  };

  return (
    <button
      onClick={handleCopy}
      className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
    >
      <Copy className="w-5 h-5" />
    </button>
  );
}
