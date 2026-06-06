import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const marketId = parseInt(id);

    if (isNaN(marketId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // Get market details first
    const { data: market, error: marketError } = await supabaseAdmin
      .from('markets')
      .select('id, options')
      .eq('id', marketId)
      .single();

    if (marketError || !market) {
      return NextResponse.json({ error: 'Mercado no encontrado' }, { status: 404 });
    }

    const numOptions = market.options.length;

    // Get all bets for this market grouped by option
    const { data: bets, error: betsError } = await supabaseAdmin
      .from('bets')
      .select('option_index, amount')
      .eq('market_id', marketId)
      .eq('status', 'active');

    if (betsError) {
      console.error('Error fetching bets:', betsError);
      // Return empty stats instead of error
      return NextResponse.json({
        success: true,
        stats: {
          total_pool: 0,
          option_pools: Array(numOptions).fill(0),
          option_bets: Array(numOptions).fill(0),
        },
      });
    }

    // Calculate pool stats
    let totalPool = 0;
    const optionPools: number[] = Array(numOptions).fill(0);
    const optionBets: number[] = Array(numOptions).fill(0);

    (bets || []).forEach((bet: any) => {
      const optionIndex = bet.option_index;
      const amount = bet.amount || 0;

      totalPool += amount;
      optionPools[optionIndex] = (optionPools[optionIndex] || 0) + amount;
      optionBets[optionIndex] = (optionBets[optionIndex] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      stats: {
        total_pool: totalPool,
        option_pools: optionPools,
        option_bets: optionBets,
      },
    });
  } catch (error) {
    console.error('Error in market stats GET:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
