import { createClient } from '@/lib/supabase/server';
import { placeUserInBinaryTree } from '@/lib/binary/placement';
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

    // Get user to approve
    const { data: userToApprove } = await supabase
      .from('user_profiles')
      .select('*, sponsor_id')
      .eq('id', id)
      .single();

    if (!userToApprove) {
      return NextResponse.json({ success: false, message: 'Usuario no encontrado' }, { status: 404 });
    }

    if (userToApprove.status !== 'pending') {
      return NextResponse.json(
        { success: false, message: 'El usuario no está pendiente de aprobación' },
        { status: 400 }
      );
    }

    // Approve user
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: user.id,
      })
      .eq('id', id);

    if (updateError) throw updateError;

    // Place in binary tree if has sponsor
    if (userToApprove.sponsor_id && !userToApprove.placement_parent_id) {
      try {
        await placeUserInBinaryTree(id, userToApprove.sponsor_id);
      } catch (error) {
        console.error('Error placing user in binary tree:', error);
        // Don't fail the approval if binary placement fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Usuario aprobado exitosamente',
    });
  } catch (error: any) {
    console.error('Error approving user:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
