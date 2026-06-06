import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// POST - Admin recarga efectivo a usuario
export async function POST(request: NextRequest) {
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
        { error: 'Solo administradores pueden hacer recargas' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { user_id, amount, notes } = body;

    // Validate
    if (!user_id || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'User ID y monto son requeridos' },
        { status: 400 }
      );
    }

    // Get user wallet
    const { data: wallet, error: walletError } = await supabaseAdmin
      .from('user_wallets')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json(
        { error: 'Usuario no encontrado o wallet no existe' },
        { status: 404 }
      );
    }

    const newBalance = wallet.balance + amount;

    // Update wallet
    const { error: updateError } = await supabaseAdmin
      .from('user_wallets')
      .update({
        balance: newBalance,
        total_deposited: wallet.total_deposited + amount,
      })
      .eq('user_id', user_id);

    if (updateError) {
      console.error('Error updating wallet:', updateError);
      return NextResponse.json(
        { error: 'Error al actualizar saldo' },
        { status: 500 }
      );
    }

    // Create transaction record
    const { error: txError } = await supabaseAdmin
      .from('wallet_transactions')
      .insert({
        user_id: user_id,
        type: 'deposit',
        amount: amount,
        balance_before: wallet.balance,
        balance_after: newBalance,
        status: 'completed',
        payment_method: 'cash',
        description: notes || `Recarga en efectivo por admin`,
        payment_metadata: {
          admin_id: user.id,
          admin_email: user.email,
          recharge_type: 'cash',
          notes: notes,
        },
        completed_at: new Date().toISOString(),
      });

    if (txError) {
      console.error('Error creating transaction:', txError);
      // Wallet already updated, log error but don't fail
    }

    return NextResponse.json({
      success: true,
      message: `Recarga exitosa: USD ${amount.toFixed(2)}`,
      new_balance: newBalance,
    });
  } catch (error) {
    console.error('Error in admin recharge:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// GET - Historial de recargas
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
        { error: 'Solo administradores pueden ver recargas' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get cash deposits
    const { data: transactions, error } = await supabaseAdmin
      .from('wallet_transactions')
      .select(`
        *,
        user_profiles!inner(email, full_name)
      `)
      .eq('type', 'deposit')
      .eq('payment_method', 'cash')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recharges:', error);
      return NextResponse.json(
        { error: 'Error al obtener recargas' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      transactions: transactions || [],
    });
  } catch (error) {
    console.error('Error in recharges GET:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
