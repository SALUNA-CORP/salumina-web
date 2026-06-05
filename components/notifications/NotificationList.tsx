'use client';

import { Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  action_url: string | null;
}

interface NotificationListProps {
  notifications: Notification[];
  onDelete: (id: number) => void;
  onMarkAsRead: (id: number) => void;
}

const typeIcons: Record<string, string> = {
  new_referral: '🎉',
  commission_earned: '💰',
  bet_won: '🎯',
  bet_lost: '😔',
  market_resolved: '📊',
  alert_triggered: '🔔',
  achievement_unlocked: '🏆',
  training_assigned: '📚',
  level_up: '⭐',
};

export function NotificationList({
  notifications,
  onDelete,
  onMarkAsRead,
}: NotificationListProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Less than 1 minute
    if (diff < 60) return 'Ahora mismo';

    // Less than 1 hour
    if (diff < 3600) {
      const mins = Math.floor(diff / 60);
      return `Hace ${mins} minuto${mins > 1 ? 's' : ''}`;
    }

    // Less than 24 hours
    if (diff < 86400) {
      const hours = Math.floor(diff / 3600);
      return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    }

    // Less than 7 days
    if (diff < 604800) {
      const days = Math.floor(diff / 86400);
      return `Hace ${days} día${days > 1 ? 's' : ''}`;
    }

    // Older - show full date
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const groupByDate = (notifications: Notification[]) => {
    const groups: Record<string, Notification[]> = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: [],
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    notifications.forEach((notification) => {
      const date = new Date(notification.created_at);
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      if (dateOnly >= today) {
        groups.today.push(notification);
      } else if (dateOnly >= yesterday) {
        groups.yesterday.push(notification);
      } else if (dateOnly >= weekAgo) {
        groups.thisWeek.push(notification);
      } else {
        groups.older.push(notification);
      }
    });

    return groups;
  };

  const groups = groupByDate(notifications);
  const groupLabels = {
    today: 'Hoy',
    yesterday: 'Ayer',
    thisWeek: 'Esta semana',
    older: 'Más antiguas',
  };

  return (
    <div className="space-y-6">
      {Object.entries(groups).map(([groupKey, groupNotifications]) => {
        if (groupNotifications.length === 0) return null;

        return (
          <div key={groupKey}>
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
              {groupLabels[groupKey as keyof typeof groupLabels]}
            </h3>
            <div className="space-y-2">
              {groupNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-all ${
                    !notification.is_read
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    if (!notification.is_read) {
                      onMarkAsRead(notification.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 text-2xl">
                      {typeIcons[notification.type] || '📬'}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                        {!notification.is_read && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {formatDate(notification.created_at)}
                        </span>
                        <div className="flex items-center gap-2">
                          {notification.action_url && (
                            <Link
                              href={notification.action_url}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                            >
                              Ver <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(notification.id);
                            }}
                            className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors"
                            title="Eliminar notificación"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {notifications.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No tienes notificaciones</p>
        </div>
      )}
    </div>
  );
}
