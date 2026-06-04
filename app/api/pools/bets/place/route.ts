import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { PlaceBetRequest, PlaceBetResponse } from '@/types/pools';

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

    const body: PlaceBetRequest = await request.json();
    const { market_id, option_index, amount } = body;

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Monto inválido' },
        { status: 400 }
      );
    }

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

    // Check market status
    if (market.status !== 'open') {
      return NextResponse.json(
        { success: false, message: 'Este mercado no está aceptando apuestas' },
        { status: 400 }
      );
    }

    // Check if market is closed
    const now = new Date();
    const closesAt = new Date(market.closes_at);
    if (now >= closesAt) {
      return NextResponse.json(
        { success: false, message: 'Este mercado ya cerró' },
        { status: 400 }
      );
    }

    // Validate option
    if (option_index < 0 || option_index >= market.options.length) {
      return NextResponse.json(
        { success: false, message: 'Opción inválida' },
        { status: 400 }
      );
    }

    // Check bet limits
    const minBet = Number(market.min_bet);
    const maxBet = Number(market.max_bet);
    const maxTotalBet = Number(market.max_total_bet);

    if (amount < minBet) {
      return NextResponse.json(
        { success: false, message: `Apuesta mínima: $${minBet}` },
        { status: 400 }
      );
    }

    if (amount > maxBet) {
      return NextResponse.json(
        { success: false, message: `Apuesta máxima: $${maxBet}` },
        { status: 400 }
      );
    }

    // Check user's total bets on this market
    const { data: userBets } = await supabaseAdmin
      .from('bets')
      .select('amount')
      .eq('market_id', market_id)
      .eq('user_id', user.id);

    const userTotalBet = userBets?.reduce((sum, bet) => sum + Number(bet.amount), 0) || 0;

    if (userTotalBet + amount > maxTotalBet) {
      return NextResponse.json(
        { success: false, message: `Máximo total por mercado: $${maxTotalBet}` },
        { status: 400 }
      );
    }

    // Get user wallet
    const { data: wallet } = await supabaseAdmin
      .from('user_wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    if (!wallet) {
      return NextResponse.json(
        { success: false, message: 'Wallet no encontrado' },
        { status: 404 }
      );
    }

    const currentBalance = Number(wallet.balance);

    // Check sufficient balance
    if (currentBalance < amount) {
      return NextResponse.json(
        { success: false, message: 'Saldo insuficiente' },
        { status: 400 }
      );
    }

    // Check if user is premium (has active subscription)
    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    const isPremium = !!subscription;
    const commissionRate = isPremium ? 0.03 : 0.06; // 3% for premium, 6% for free

    // Calculate estimated odds
    const poolStats = market.pool_stats || [];
    const totalPool = poolStats.reduce((sum: number, ps: any) => sum + Number(ps.total_amount), 0);
    const optionPool = poolStats.find((ps: any) => ps.option_index === option_index);
    const optionAmount = optionPool ? Number(optionPool.total_amount) : 0;

    // Estimated odds after this bet
    const newTotalPool = totalPool + amount;
    const newOptionAmount = optionAmount + amount;
    const estimatedOdds = newTotalPool > 0 && newOptionAmount > 0
      ? parseFloat((newTotalPool / newOptionAmount).toFixed(4))
      : 1.0;

    // Deduct from wallet
    const newBalance = currentBalance - amount;

    const { error: walletError } = await supabaseAdmin
      .from('user_wallets')
      .update({
        balance: newBalance,
        total_wagered: supabaseAdmin.sql`total_wagered + ${amount}`,
      })
      .eq('user_id', user.id);

    if (walletError) {
      console.error('Error updating wallet:', walletError);
      return NextResponse.json(
        { success: false, message: 'Error al actualizar saldo' },
        { status: 500 }
      );
    }

    // Create bet
    const { data: bet, error: betError } = await supabaseAdmin
      .from('bets')
      .insert({
        market_id,
        user_id: user.id,
        option_index,
        amount,
        is_premium: isPremium,
        commission_rate: commissionRate,
        estimated_odds: estimatedOdds,
      })
      .select()
      .single();

    if (betError || !bet) {
      console.error('Error creating bet:', betError);

      // Rollback wallet update
      await supabaseAdmin
        .from('user_wallets')
        .update({
          balance: currentBalance,
          total_wagered: supabaseAdmin.sql`total_wagered - ${amount}`,
        })
        .eq('user_id', user.id);

      return NextResponse.json(
        { success: false, message: 'Error al crear apuesta' },
        { status: 500 }
      );
    }

    // Create transaction record
    await supabaseAdmin.from('wallet_transactions').insert({
      user_id: user.id,
      type: 'bet_placed',
      amount,
      balance_before: currentBalance,
      balance_after: newBalance,
      status: 'completed',
      description: `Apuesta en: ${market.title} - ${market.options[option_index]}`,
      reference_id: bet.id,
      reference_type: 'bet',
      completed_at: new Date().toISOString(),
    });

    // Pool stats are updated automatically by trigger

    const response: PlaceBetResponse = {
      success: true,
      bet_id: bet.id,
      estimated_odds: estimatedOdds,
      new_balance: newBalance,
      message: `Apuesta colocada: $${amount} en "${market.options[option_index]}"`,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error placing bet:', error);
    return NextResponse.json(
      { success: false, message: 'Error del servidor' },
      { status: 500 }
    );
  }
}
