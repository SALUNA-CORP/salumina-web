import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verify admin
    const { data: adminData } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (adminData?.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Solo administradores' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
    }

    // Find user in auth.users
    const { data: authUsers, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers();

    if (authUsersError) {
      console.error('Error listing users:', authUsersError);
      return NextResponse.json(
        { error: 'Error al buscar usuario' },
        { status: 500 }
      );
    }

    const foundUser = authUsers.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (!foundUser) {
      return NextResponse.json({
        success: false,
        error: 'Usuario no encontrado',
      });
    }

    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', foundUser.id)
      .single();

    // Get wallet
    const { data: wallet } = await supabaseAdmin
      .from('user_wallets')
      .select('balance')
      .eq('user_id', foundUser.id)
      .single();

    return NextResponse.json({
      success: true,
      user: {
        id: foundUser.id,
        email: foundUser.email,
        full_name: profile?.full_name,
        current_balance: wallet?.balance || 0,
      },
    });
  } catch (error) {
    console.error('Error in find user:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
