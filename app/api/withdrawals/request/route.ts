import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const { amount, currency, crypto, walletAddress } = await request.json();

    // Validate amount
    const { data: commissions } = await supabase
      .from('commissions')
      .select('amount')
      .eq('user_id', user.id)
      .eq('status', 'available');

    const availableBalance = commissions?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;

    if (parseFloat(amount) > availableBalance) {
      return NextResponse.json(
        { success: false, message: 'Saldo insuficiente' },
        { status: 400 }
      );
    }

    // Create withdrawal request
    const { error } = await supabase.from('withdrawals').insert({
      user_id: user.id,
      amount: parseFloat(amount),
      currency,
      crypto,
      wallet_address: walletAddress,
      status: 'pending',
    });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Solicitud de retiro creada exitosamente',
    });
  } catch (error: any) {
    console.error('Error creating withdrawal:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
