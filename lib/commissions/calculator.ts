import { supabaseAdmin } from '@/lib/supabase/admin';

export async function calculateDirectCommission(
  sponsorId: string,
  referralPayment: number,
  currency: 'USD' | 'COP'
): Promise<void> {
  // Get commission config
  const { data: config } = await supabaseAdmin
    .from('commission_config')
    .select('direct_commission_percentage')
    .single();

  if (!config) return;

  const commissionAmount = (referralPayment * config.direct_commission_percentage) / 100;

  // Create commission record
  await supabaseAdmin.from('commissions').insert({
    user_id: sponsorId,
    type: 'direct',
    amount: commissionAmount,
    currency,
    status: 'available',
  });
}

export async function calculateBinaryCommissions(
  userId: string,
  depth: number = 20
): Promise<void> {
  // Get all uplines up to 20 levels
  const uplines = await getUplines(userId, depth);

  // Get binary commission levels config
  const { data: levels } = await supabaseAdmin
    .from('binary_commission_levels')
    .select('*')
    .order('level');

  if (!levels) return;

  for (let i = 0; i < uplines.length && i < levels.length; i++) {
    const upline = uplines[i];
    const levelConfig = levels[i];

    // Check if upline has at least 1 active user in each leg
    const { count: leftActive } = await supabaseAdmin
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('placement_parent_id', upline.id)
      .eq('leg', 'left')
      .eq('status', 'approved');

    const { count: rightActive } = await supabaseAdmin
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('placement_parent_id', upline.id)
      .eq('leg', 'right')
      .eq('status', 'approved');

    if (!leftActive || !rightActive) {
      continue; // Skip if doesn't meet minimum requirement
    }

    // Calculate volume for each leg
    const leftVolume = await calculateLegVolume(upline.id, 'left');
    const rightVolume = await calculateLegVolume(upline.id, 'right');

    // Create commission for each leg independently
    if (leftVolume > 0) {
      const leftCommission = (leftVolume * levelConfig.percentage) / 100;
      await supabaseAdmin.from('commissions').insert({
        user_id: upline.id,
        type: 'binary',
        level: levelConfig.level,
        amount: leftCommission,
        currency: 'USD',
        leg: 'left',
        status: 'available',
      });
    }

    if (rightVolume > 0) {
      const rightCommission = (rightVolume * levelConfig.percentage) / 100;
      await supabaseAdmin.from('commissions').insert({
        user_id: upline.id,
        type: 'binary',
        level: levelConfig.level,
        amount: rightCommission,
        currency: 'USD',
        leg: 'right',
        status: 'available',
      });
    }
  }
}

async function getUplines(userId: string, maxDepth: number): Promise<any[]> {
  const uplines: any[] = [];
  let currentId = userId;

  for (let i = 0; i < maxDepth; i++) {
    const { data: user } = await supabaseAdmin
      .from('user_profiles')
      .select('id, placement_parent_id, status')
      .eq('id', currentId)
      .single();

    if (!user || !user.placement_parent_id) break;

    uplines.push({
      id: user.placement_parent_id,
      level: i + 2, // Level 1 is direct, binary starts at 2
    });

    currentId = user.placement_parent_id;
  }

  return uplines;
}

async function calculateLegVolume(userId: string, leg: 'left' | 'right'): Promise<number> {
  // Get child in specified leg
  const { data: child } = await supabaseAdmin
    .from('user_profiles')
    .select('id')
    .eq('placement_parent_id', userId)
    .eq('leg', leg)
    .single();

  if (!child) return 0;

  // Get all active subscriptions in this leg's downline
  const descendants = await getAllDescendants(child.id);
  let totalVolume = 0;

  for (const desc of descendants) {
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('total_amount')
      .eq('user_id', desc)
      .eq('status', 'active')
      .single();

    if (sub) {
      totalVolume += Number(sub.total_amount);
    }
  }

  return totalVolume;
}

async function getAllDescendants(userId: string): Promise<string[]> {
  const descendants: string[] = [userId];
  const queue: string[] = [userId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;

    const { data: children } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('placement_parent_id', currentId);

    if (children) {
      const childIds = children.map((c) => c.id);
      descendants.push(...childIds);
      queue.push(...childIds);
    }
  }

  return descendants;
}
