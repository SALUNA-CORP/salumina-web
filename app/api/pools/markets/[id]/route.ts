import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// GET /api/pools/markets/[id] - Get single market with detailed stats
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const marketId = parseInt(params.id);

    if (isNaN(marketId)) {
      return NextResponse.json(
        { success: false, message: 'ID de mercado inválido' },
        { status: 400 }
      );
    }

    // Get market
    const { data: market, error: marketError } = await supabaseAdmin
      .from('markets')
      .select(`
        *,
        pool_stats (*)
      `)
      .eq('id', marketId)
      .single();

    if (marketError || !market) {
      return NextResponse.json(
        { success: false, message: 'Mercado no encontrado' },
        { status: 404 }
      );
    }

    // Calculate stats
    const poolStats = market.pool_stats || [];
    const totalPool = poolStats.reduce((sum: number, ps: any) => sum + Number(ps.total_amount), 0);
    const totalBets = poolStats.reduce((sum: number, ps: any) => sum + Number(ps.total_bets), 0);

    // Calculate odds for each option
    const oddsCalculations = market.options.map((optionName: string, index: number) => {
      const optionPool = poolStats.find((ps: any) => ps.option_index === index);
      const optionAmount = optionPool ? Number(optionPool.total_amount) : 0;
      const optionBets = optionPool ? optionPool.total_bets : 0;

      let estimatedOdds = 1.0;
      if (totalPool > 0 && optionAmount > 0) {
        estimatedOdds = totalPool / optionAmount;
      }

      return {
        option_index: index,
        option_name: optionName,
        total_in_option: optionAmount,
        total_bets: optionBets,
        estimated_odds: parseFloat(estimatedOdds.toFixed(2)),
        would_return: parseFloat(estimatedOdds.toFixed(2)), // For $1 bet
      };
    });

    // Calculate time until closes
    const closesAt = new Date(market.closes_at);
    const now = new Date();
    const closesInMinutes = Math.max(0, Math.floor((closesAt.getTime() - now.getTime()) / 1000 / 60));

    return NextResponse.json({
      success: true,
      market: {
        ...market,
        total_pool: totalPool,
        total_bets: totalBets,
        odds: oddsCalculations,
        closes_in_minutes: closesInMinutes,
      },
    });
  } catch (error) {
    console.error('Error fetching market:', error);
    return NextResponse.json(
      { success: false, message: 'Error del servidor' },
      { status: 500 }
    );
  }
}
