import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // Filter by bet status
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query using view
    let query = supabaseAdmin
      .from('user_bet_history')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('bet_placed_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('bet_status', status);
    }

    const { data: bets, error: betsError, count } = await query;

    if (betsError) {
      console.error('Error fetching bet history:', betsError);
      return NextResponse.json(
        { success: false, message: 'Error al obtener historial' },
        { status: 500 }
      );
    }

    // Format bets
    const formattedBets = bets?.map((bet) => ({
      ...bet,
      amount: Number(bet.amount),
      payout: bet.payout ? Number(bet.payout) : null,
      net_payout: bet.net_payout ? Number(bet.net_payout) : null,
      commission_rate: Number(bet.commission_rate),
      option_name: bet.options[bet.option_index],
    }));

    return NextResponse.json({
      success: true,
      bets: formattedBets,
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error in GET /api/pools/bets/history:', error);
    return NextResponse.json(
      { success: false, message: 'Error del servidor' },
      { status: 500 }
    );
  }
}
