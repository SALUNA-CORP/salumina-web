import { supabaseAdmin } from '@/lib/supabase/admin';

export type NotificationType =
  | 'new_referral'
  | 'commission_earned'
  | 'bet_won'
  | 'bet_lost'
  | 'market_resolved'
  | 'alert_triggered'
  | 'achievement_unlocked'
  | 'training_assigned'
  | 'level_up';

interface NotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  actionUrl?: string;
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  data,
  actionUrl,
}: NotificationData) {
  try {
    const { data: notification, error } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        data: data || null,
        action_url: actionUrl || null,
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return { success: false, error };
    }

    return { success: true, notification };
  } catch (error) {
    console.error('Error in createNotification:', error);
    return { success: false, error };
  }
}

// Helper functions for common notification types

export async function notifyNewReferral(userId: string, referralName: string) {
  return createNotification({
    userId,
    type: 'new_referral',
    title: '🎉 Nuevo Referido',
    message: `${referralName} se unió a tu red`,
    actionUrl: '/dashboard/network',
  });
}

export async function notifyCommissionEarned(userId: string, amount: number) {
  return createNotification({
    userId,
    type: 'commission_earned',
    title: '💰 Comisión Ganada',
    message: `Has ganado $${amount.toLocaleString()} en comisiones`,
    data: { amount },
    actionUrl: '/dashboard/commissions',
  });
}

export async function notifyBetWon(userId: string, marketTitle: string, payout: number) {
  return createNotification({
    userId,
    type: 'bet_won',
    title: '🎯 ¡Ganaste!',
    message: `Tu predicción en "${marketTitle}" fue ganadora. Ganaste $${payout.toLocaleString()}`,
    data: { payout },
    actionUrl: '/dashboard/pools/history',
  });
}

export async function notifyBetLost(userId: string, marketTitle: string) {
  return createNotification({
    userId,
    type: 'bet_lost',
    title: '😔 Predicción Perdida',
    message: `Tu predicción en "${marketTitle}" no fue ganadora`,
    actionUrl: '/dashboard/pools/history',
  });
}

export async function notifyMarketResolved(userId: string, marketTitle: string) {
  return createNotification({
    userId,
    type: 'market_resolved',
    title: '📊 Mercado Resuelto',
    message: `El mercado "${marketTitle}" ha sido resuelto`,
    actionUrl: '/dashboard/pools/history',
  });
}

export async function notifyAlertTriggered(userId: string, alertType: string, marketTitle: string) {
  return createNotification({
    userId,
    type: 'alert_triggered',
    title: '🔔 Alerta Disparada',
    message: `${alertType}: ${marketTitle}`,
    actionUrl: '/dashboard/pools/alerts',
  });
}

export async function notifyAchievementUnlocked(
  userId: string,
  achievementName: string,
  achievementIcon: string
) {
  return createNotification({
    userId,
    type: 'achievement_unlocked',
    title: '🏆 Logro Desbloqueado',
    message: `¡Felicidades! Has desbloqueado "${achievementName}" ${achievementIcon}`,
    actionUrl: '/dashboard/achievements',
  });
}

export async function notifyTrainingAssigned(userId: string, trainingTitle: string) {
  return createNotification({
    userId,
    type: 'training_assigned',
    title: '📚 Nuevo Material de Training',
    message: `Se ha asignado "${trainingTitle}" a tu training center`,
    actionUrl: '/dashboard/training',
  });
}

export async function notifyLevelUp(userId: string, newLevel: string) {
  return createNotification({
    userId,
    type: 'level_up',
    title: '⭐ ¡Subiste de Nivel!',
    message: `Has alcanzado el nivel ${newLevel}`,
    actionUrl: '/dashboard',
  });
}
