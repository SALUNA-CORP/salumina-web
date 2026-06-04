import { supabaseAdmin } from '@/lib/supabase/admin';

interface UserNode {
  id: string;
  placement_parent_id: string | null;
  leg: 'left' | 'right' | null;
}

export async function findWeakestLeg(sponsorId: string): Promise<{
  parentId: string;
  leg: 'left' | 'right';
}> {
  // Start from sponsor
  let currentParent = sponsorId;
  let targetLeg: 'left' | 'right' = 'left';

  // Traverse tree to find the weakest leg position
  while (true) {
    // Get children of current node
    const { data: children } = await supabaseAdmin
      .from('user_profiles')
      .select('id, leg')
      .eq('placement_parent_id', currentParent);

    if (!children || children.length === 0) {
      // No children, place here
      return {
        parentId: currentParent,
        leg: 'left', // Default to left if no children
      };
    }

    const hasLeft = children.some((c) => c.leg === 'left');
    const hasRight = children.some((c) => c.leg === 'right');

    if (!hasLeft) {
      // Left is empty
      return {
        parentId: currentParent,
        leg: 'left',
      };
    }

    if (!hasRight) {
      // Right is empty
      return {
        parentId: currentParent,
        leg: 'right',
      };
    }

    // Both legs exist, calculate volumes
    const leftChild = children.find((c) => c.leg === 'left');
    const rightChild = children.find((c) => c.leg === 'right');

    const leftVolume = await calculateLegVolume(leftChild!.id, 'left');
    const rightVolume = await calculateLegVolume(rightChild!.id, 'right');

    // Go down the weaker leg
    if (leftVolume <= rightVolume) {
      currentParent = leftChild!.id;
      targetLeg = 'left';
    } else {
      currentParent = rightChild!.id;
      targetLeg = 'right';
    }
  }
}

export async function calculateLegVolume(
  userId: string,
  leg: 'left' | 'right'
): Promise<number> {
  // Get all descendants in this leg
  const descendants = await getDescendants(userId);

  // Count active users with subscriptions
  let volume = 0;

  for (const desc of descendants) {
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('total_amount')
      .eq('user_id', desc.id)
      .eq('status', 'active')
      .single();

    if (subscription) {
      volume += Number(subscription.total_amount);
    }
  }

  return volume;
}

async function getDescendants(userId: string): Promise<UserNode[]> {
  const descendants: UserNode[] = [];
  const queue: string[] = [userId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;

    const { data: children } = await supabaseAdmin
      .from('user_profiles')
      .select('id, placement_parent_id, leg')
      .eq('placement_parent_id', currentId);

    if (children) {
      descendants.push(...children);
      queue.push(...children.map((c) => c.id));
    }
  }

  return descendants;
}

export async function placeUserInBinaryTree(
  userId: string,
  sponsorId: string
): Promise<void> {
  // Find weakest position
  const { parentId, leg } = await findWeakestLeg(sponsorId);

  // Update user placement
  await supabaseAdmin
    .from('user_profiles')
    .update({
      placement_parent_id: parentId,
      leg,
    })
    .eq('id', userId);
}
