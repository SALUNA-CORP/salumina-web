'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { Check, X } from 'lucide-react';

export function ApproveUserButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { showToast } = useToast();

  const handleApprove = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        showToast('Usuario aprobado exitosamente', 'success');
        router.refresh();
        setShowModal(false);
      } else {
        showToast(data.message || 'Error al aprobar usuario', 'error');
      }
    } catch (error) {
      showToast('Error al procesar la solicitud', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        disabled={loading}
        className="bg-green-600 hover:bg-green-700 gap-2"
      >
        <Check className="w-4 h-4" />
        Aprobar
      </Button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleApprove}
        title="Aprobar Usuario"
        description="¿Estás seguro de aprobar este usuario? Podrá acceder al sistema inmediatamente."
        confirmText="Sí, aprobar"
        cancelText="Cancelar"
        loading={loading}
      />
    </>
  );
}

export function RejectUserButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { showToast } = useToast();

  const handleReject = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: '' }),
      });

      const data = await response.json();

      if (data.success) {
        showToast('Usuario rechazado', 'success');
        router.push('/admin/users');
        setShowModal(false);
      } else {
        showToast(data.message || 'Error al rechazar usuario', 'error');
      }
    } catch (error) {
      showToast('Error al procesar la solicitud', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        disabled={loading}
        variant="destructive"
        className="gap-2"
      >
        <X className="w-4 h-4" />
        Rechazar
      </Button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleReject}
        title="Rechazar Usuario"
        description="¿Estás seguro de rechazar este usuario? Esta acción no se puede deshacer."
        confirmText="Sí, rechazar"
        cancelText="Cancelar"
        variant="destructive"
        loading={loading}
      />
    </>
  );
}
