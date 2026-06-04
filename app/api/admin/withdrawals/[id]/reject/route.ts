import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const { data: adminProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!adminProfile || adminProfile.role !== 'superadmin') {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    const { reason } = await request.json();

    // Get withdrawal to refund commission
    const { data: withdrawal } = await supabaseAdmin
      .from('withdrawals')
      .select('user_id, amount')
      .eq('id', id)
      .single();

    if (withdrawal) {
      // Update withdrawal status
      await supabaseAdmin
        .from('withdrawals')
        .update({
          status: 'rejected',
          rejected_reason: reason,
        })
        .eq('id', id);

      // Refund: mark commissions as available again
      // (In a real system, you'd track which commissions were used)
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
