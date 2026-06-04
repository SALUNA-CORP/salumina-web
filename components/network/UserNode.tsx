'use client';

import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { User, Mail, Calendar, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface UserNodeProps {
  data: {
    user: {
      id: string;
      full_name: string;
      email: string;
      referral_code: string;
      status: string;
      created_at: string;
    };
    onSelect: (user: any) => void;
    onNavigate: (userId: string) => void;
    isAdmin: boolean;
  };
}

export const UserNode = memo(({ data }: UserNodeProps) => {
  const { user, onNavigate, isAdmin } = data;

  const statusColors = {
    approved: 'bg-green-500',
    pending: 'bg-yellow-500',
    inactive: 'bg-gray-400',
  };

  const statusColor = statusColors[user.status as keyof typeof statusColors] || 'bg-gray-400';

  return (
    <div className="relative group">
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-blue-500" />

      <div className="bg-white border-2 border-gray-300 rounded-lg shadow-lg hover:shadow-xl transition-all w-64 p-4">
        {/* Status Indicator */}
        <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${statusColor}`} />

        {/* User Info */}
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {user.full_name?.charAt(0) || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate text-sm">
              {user.full_name || 'Usuario'}
            </h3>
            <p className="text-xs text-gray-500 truncate flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {user.email}
            </p>
            <p className="text-xs font-mono font-semibold text-blue-600 mt-1">
              {user.referral_code}
            </p>
          </div>
        </div>

        {/* Date */}
        <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(user.created_at).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
            user.status === 'approved' ? 'bg-green-100 text-green-800' :
            user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {user.status === 'approved' ? 'Activo' :
             user.status === 'pending' ? 'Pendiente' : 'Inactivo'}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => onNavigate(user.id)}
            className="flex-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-medium transition-colors"
          >
            Ver Red
          </button>
          {isAdmin && (
            <Link
              href={`/admin/users/${user.id}`}
              className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded text-xs font-medium transition-colors flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Detalle
            </Link>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-blue-500" />
    </div>
  );
});

UserNode.displayName = 'UserNode';
