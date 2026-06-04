import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 401 });
    }

    // Get wallet
    const { data: wallet, error: walletError } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (walletError) {
      return NextResponse.json(
        { success: false, message: 'Error al obtener balance' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      wallet: {
        balance: Number(wallet.balance),
        total_deposited: Number(wallet.total_deposited),
        total_withdrawn: Number(wallet.total_withdrawn),
        total_wagered: Number(wallet.total_wagered),
        total_won: Number(wallet.total_won),
      },
    });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return NextResponse.json(
      { success: false, message: 'Error del servidor' },
      { status: 500 }
    );
  }
}
