import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { ResolveMarketRequest, ResolveMarketResponse } from '@/types/pools';

export async function POST(request: NextRequest) {
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

    // Check if user is admin
    const { data: userData } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, message: 'Solo administradores pueden resolver mercados' },
        { status: 403 }
      );
    }

    const body: ResolveMarketRequest = await request.json();
    const { market_id, winning_option, resolution_source } = body;

    // Get market
    const { data: market, error: marketError } = await supabaseAdmin
      .from('markets')
      .select('*, pool_stats (*)')
      .eq('id', market_id)
      .single();

    if (marketError || !market) {
      return NextResponse.json(
        { success: false, message: 'Mercado no encontrado' },
        { status: 404 }
      );
    }

    // Validate status
    if (market.status === 'resolved') {
      return NextResponse.json(
        { success: false, message: 'Este mercado ya fue resuelto' },
        { status: 400 }
      );
    }

    if (market.status === 'cancelled') {
      return NextResponse.json(
        { success: false, message: 'Este mercado fue cancelado' },
        { status: 400 }
      );
    }

    // Validate winning option
    if (winning_option < 0 || winning_option >= market.options.length) {
      return NextResponse.json(
        { success: false, message: 'Opción ganadora inválida' },
        { status: 400 }
      );
    }

    // Calculate pool totals
    const poolStats = market.pool_stats || [];
    const totalPool = poolStats.reduce((sum: number, ps: any) => sum + Number(ps.total_amount), 0);

    if (totalPool === 0) {
      // No bets placed, just mark as resolved
      await supabaseAdmin
        .from('markets')
        .update({
          status: 'resolved',
          winning_option,
          resolution_source,
          resolved_by: user.id,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', market_id);

      return NextResponse.json({
        success: true,
        payouts_processed: 0,
        total_payout_amount: 0,
        message: 'Mercado resuelto (sin apuestas)',
      });
    }

    // Get winning pool stats
    const winningPool = poolStats.find((ps: any) => ps.option_index === winning_option);
    const winningAmount = winningPool ? Number(winningPool.total_amount) : 0;

    if (winningAmount === 0) {
      // No one bet on winning option - house keeps all
      // Mark all bets as lost
      await supabaseAdmin
        .from('bets')
        .update({
          status: 'lost',
          payout: 0,
          commission_charged: 0,
          net_payout: 0,
          resolved_at: new Date().toISOString(),
        })
        .eq('market_id', market_id);

      // Mark market as resolved
      await supabaseAdmin
        .from('markets')
        .update({
          status: 'resolved',
          winning_option,
          resolution_source,
          resolved_by: user.id,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', market_id);

      return NextResponse.json({
        success: true,
        payouts_processed: 0,
        total_payout_amount: 0,
        message: 'Mercado resuelto (nadie apostó a la opción ganadora)',
      });
    }

    // Get all winning bets
    const { data: winningBets, error: betsError } = await supabaseAdmin
      .from('bets')
      .select('*')
      .eq('market_id', market_id)
      .eq('option_index', winning_option);

    if (betsError) {
      console.error('Error fetching winning bets:', betsError);
      return NextResponse.json(
        { success: false, message: 'Error al obtener apuestas ganadoras' },
        { status: 500 }
      );
    }

    // Calculate payouts
    let totalPayoutAmount = 0;
    const payoutUpdates: any[] = [];

    for (const bet of winningBets || []) {
      const betAmount = Number(bet.amount);
      const commissionRate = Number(bet.commission_rate);

      // Gross payout (proportional share of total pool)
      const grossPayout = (betAmount / winningAmount) * totalPool;

      // Commission
      const commission = grossPayout * commissionRate;

      // Net payout
      const netPayout = grossPayout - commission;

      totalPayoutAmount += netPayout;

      payoutUpdates.push({
        id: bet.id,
        payout: grossPayout,
        commission_charged: commission,
        net_payout: netPayout,
      });

      // Create wallet transaction
      const { data: wallet } = await supabaseAdmin
        .from('user_wallets')
        .select('balance, total_won')
        .eq('user_id', bet.user_id)
        .single();

      if (wallet) {
        const currentBalance = Number(wallet.balance);
        const currentTotalWon = Number(wallet.total_won || 0);
        const newBalance = currentBalance + netPayout;

        // Credit user wallet
        await supabaseAdmin
          .from('user_wallets')
          .update({
            balance: newBalance,
            total_won: currentTotalWon + netPayout,
          })
          .eq('user_id', bet.user_id);

        // Create transaction record
        await supabaseAdmin.from('wallet_transactions').insert({
          user_id: bet.user_id,
          type: 'bet_won',
          amount: netPayout,
          balance_before: currentBalance,
          balance_after: newBalance,
          status: 'completed',
          description: `Ganancia de apuesta en: ${market.title}`,
          reference_id: bet.id,
          reference_type: 'bet',
          completed_at: new Date().toISOString(),
        });
      }
    }

    // Update all winning bets
    for (const update of payoutUpdates) {
      await supabaseAdmin
        .from('bets')
        .update({
          status: 'won',
          payout: update.payout,
          commission_charged: update.commission_charged,
          net_payout: update.net_payout,
          resolved_at: new Date().toISOString(),
        })
        .eq('id', update.id);
    }

    // Mark all losing bets
    await supabaseAdmin
      .from('bets')
      .update({
        status: 'lost',
        payout: 0,
        commission_charged: 0,
        net_payout: 0,
        resolved_at: new Date().toISOString(),
      })
      .eq('market_id', market_id)
      .neq('option_index', winning_option);

    // Mark market as resolved
    await supabaseAdmin
      .from('markets')
      .update({
        status: 'resolved',
        winning_option,
        resolution_source,
        resolved_by: user.id,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', market_id);

    const response: ResolveMarketResponse = {
      success: true,
      payouts_processed: winningBets?.length || 0,
      total_payout_amount: parseFloat(totalPayoutAmount.toFixed(2)),
      message: `Mercado resuelto. ${winningBets?.length || 0} apuestas ganadoras pagadas.`,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error resolving market:', error);
    return NextResponse.json(
      { success: false, message: 'Error del servidor' },
      { status: 500 }
    );
  }
}
