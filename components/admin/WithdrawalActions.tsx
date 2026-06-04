'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';

export function WithdrawalActions({ withdrawalId }: { withdrawalId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const { showToast } = useToast();

  const handleApprove = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/withdrawals/${withdrawalId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: '' }),
      });

      const data = await response.json();

      if (data.success) {
        showToast('Retiro aprobado exitosamente', 'success');
        router.refresh();
        setShowApproveModal(false);
      } else {
        showToast(data.message || 'Error al aprobar', 'error');
      }
    } catch (error) {
      showToast('Error al procesar la solicitud', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/withdrawals/${withdrawalId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Rechazado por el administrador' }),
      });

      const data = await response.json();

      if (data.success) {
        showToast('Retiro rechazado', 'success');
        router.refresh();
        setShowRejectModal(false);
      } else {
        showToast(data.message || 'Error al rechazar', 'error');
      }
    } catch (error) {
      showToast('Error al procesar la solicitud', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          onClick={() => setShowApproveModal(true)}
          disabled={loading}
          size="sm"
          className="bg-green-600 hover:bg-green-700"
        >
          Aprobar
        </Button>
        <Button
          onClick={() => setShowRejectModal(true)}
          disabled={loading}
          size="sm"
          variant="destructive"
        >
          Rechazar
        </Button>
      </div>

      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApprove}
        title="Aprobar Retiro"
        description="¿Confirmas que deseas aprobar este retiro? Se procesará el pago."
        confirmText="Sí, aprobar"
        cancelText="Cancelar"
        loading={loading}
      />

      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleReject}
        title="Rechazar Retiro"
        description="¿Estás seguro de rechazar este retiro? El saldo será devuelto al usuario."
        confirmText="Sí, rechazar"
        cancelText="Cancelar"
        variant="destructive"
        loading={loading}
      />
    </>
  );
}
