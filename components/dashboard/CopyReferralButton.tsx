'use client';

import { useToast } from '@/components/ui/toast';

export function CopyReferralButton({ referralCode }: { referralCode: string }) {
  const { showToast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/register?ref=${referralCode}`
    );
    showToast('Link copiado al portapapeles', 'success');
  };

  return (
    <button
      onClick={handleCopy}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      Copiar Link
    </button>
  );
}
