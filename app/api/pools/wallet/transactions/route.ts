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

    // Get query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type'); // Filter by type

    // Build query
    let query = supabase
      .from('wallet_transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) {
      query = query.eq('type', type);
    }

    const { data: transactions, error: txError, count } = await query;

    if (txError) {
      return NextResponse.json(
        { success: false, message: 'Error al obtener transacciones' },
        { status: 500 }
      );
    }

    // Convert decimal strings to numbers
    const formattedTransactions = transactions?.map((tx) => ({
      ...tx,
      amount: Number(tx.amount),
      balance_before: Number(tx.balance_before),
      balance_after: Number(tx.balance_after),
    }));

    return NextResponse.json({
      success: true,
      transactions: formattedTransactions,
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { success: false, message: 'Error del servidor' },
      { status: 500 }
    );
  }
}
