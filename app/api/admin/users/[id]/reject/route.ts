import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Verify admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const { data: adminProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!adminProfile || adminProfile.role !== 'superadmin') {
      return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 403 });
    }

    const { reason } = await request.json();

    // Reject user
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        status: 'inactive',
        rejected_at: new Date().toISOString(),
        rejected_reason: reason || null,
      })
      .eq('id', id);

    if (updateError) throw updateError;

    return NextResponse.json({
      success: true,
      message: 'Usuario rechazado',
    });
  } catch (error: any) {
    console.error('Error rejecting user:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
