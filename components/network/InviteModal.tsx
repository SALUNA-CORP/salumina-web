'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { Copy, Mail, Share2, MessageSquare } from 'lucide-react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    full_name: string;
    referral_code: string;
  };
}

export function InviteModal({ isOpen, onClose, user }: InviteModalProps) {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  const referralLink = `${window.location.origin}/register?ref=${user.referral_code}`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copiado al portapapeles`, 'success');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent('¡Únete a Salumina!');
    const body = encodeURIComponent(
      `Hola,\n\n${user.full_name} te invita a unirte a Salumina, la plataforma de marketing multinivel con acceso exclusivo al scanner de arbitrajes deportivos.\n\nUsa este link para registrarte:\n${referralLink}\n\nO usa el código de referido: ${user.referral_code}\n\n¡Nos vemos dentro!`
    );
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
    setEmail('');
    showToast('Email abierto en tu cliente de correo', 'success');
  };

  const shareViaWhatsApp = () => {
    const text = encodeURIComponent(
      `¡Hola! ${user.full_name} te invita a unirte a Salumina 🚀\n\nAcceso exclusivo al scanner de arbitrajes deportivos.\n\nRegistrate aquí: ${referralLink}\n\nCódigo: ${user.referral_code}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
    showToast('WhatsApp abierto', 'success');
  };

  const shareViaTelegram = () => {
    const text = encodeURIComponent(
      `¡Hola! ${user.full_name} te invita a unirte a Salumina 🚀\n\nAcceso exclusivo al scanner de arbitrajes deportivos.\n\nRegistrate aquí: ${referralLink}\n\nCódigo: ${user.referral_code}`
    );
    window.open(`https://t.me/share/url?url=${referralLink}&text=${text}`, '_blank');
    showToast('Telegram abierto', 'success');
  };

  const inviteMessage = `¡Hola! ${user.full_name} te invita a unirte a Salumina.

Acceso exclusivo al scanner de arbitrajes deportivos y oportunidades de generar ingresos con nuestro sistema MLM.

Regístrate con este link:
${referralLink}

O usa el código de referido: ${user.referral_code}

¡Únete ahora!`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invitar a la Red"
      description={`Invita personas a la red de ${user.full_name}`}
      confirmText="Cerrar"
      onConfirm={onClose}
    >
      <div className="space-y-6 py-4">
        {/* Referral Code */}
        <div className="space-y-2">
          <Label>Código de Referido</Label>
          <div className="flex gap-2">
            <Input
              value={user.referral_code}
              readOnly
              className="font-mono font-bold text-lg"
            />
            <Button
              variant="outline"
              onClick={() => copyToClipboard(user.referral_code, 'Código')}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Referral Link */}
        <div className="space-y-2">
          <Label>Link de Referido</Label>
          <div className="flex gap-2">
            <Input value={referralLink} readOnly className="text-sm" />
            <Button
              variant="outline"
              onClick={() => copyToClipboard(referralLink, 'Link')}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="space-y-2">
          <Label>Compartir por</Label>
          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="flex flex-col gap-2 h-auto py-4"
              onClick={shareViaWhatsApp}
            >
              <MessageSquare className="w-6 h-6 text-green-600" />
              <span className="text-xs">WhatsApp</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col gap-2 h-auto py-4"
              onClick={shareViaTelegram}
            >
              <Share2 className="w-6 h-6 text-blue-500" />
              <span className="text-xs">Telegram</span>
            </Button>
            <Button
              variant="outline"
              className="flex flex-col gap-2 h-auto py-4"
              onClick={() => copyToClipboard(inviteMessage, 'Mensaje')}
            >
              <Copy className="w-6 h-6 text-gray-600" />
              <span className="text-xs">Copiar Msg</span>
            </Button>
          </div>
        </div>

        {/* Email Invite */}
        <div className="space-y-2">
          <Label>Invitar por Email</Label>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="email@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              onClick={shareViaEmail}
              disabled={!email || sending}
              className="flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Enviar
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Abrirá tu cliente de correo con el mensaje pre-escrito
          </p>
        </div>

        {/* Preview Message */}
        <div className="space-y-2">
          <Label>Vista Previa del Mensaje</Label>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
            {inviteMessage}
          </div>
        </div>
      </div>
    </Modal>
  );
}
