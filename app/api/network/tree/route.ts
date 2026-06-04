import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const depth = parseInt(searchParams.get('depth') || '3');

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const targetUserId = userId || user.id;

    // Build tree
    const tree = await buildTree(targetUserId, depth, supabase);

    return NextResponse.json({ success: true, tree });
  } catch (error: any) {
    console.error('Error building tree:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function buildTree(userId: string, maxDepth: number, supabase: any, currentDepth = 0): Promise<any> {
  if (currentDepth >= maxDepth) {
    return null;
  }

  const { data: user } = await supabase
    .from('user_profiles')
    .select('id, email, full_name, status, referral_code')
    .eq('id', userId)
    .single();

  if (!user) {
    return null;
  }

  // Get children
  const { data: children } = await supabase
    .from('user_profiles')
    .select('id, leg')
    .eq('placement_parent_id', userId);

  const left = children?.find((c: any) => c.leg === 'left');
  const right = children?.find((c: any) => c.leg === 'right');

  return {
    ...user,
    left: left ? await buildTree(left.id, maxDepth, supabase, currentDepth + 1) : null,
    right: right ? await buildTree(right.id, maxDepth, supabase, currentDepth + 1) : null,
  };
}
