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

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status'); // 'won', 'lost', 'pending'

    // Get user's bets with market details
    let query = supabaseAdmin
      .from('bets')
      .select(`
        *,
        markets (
          id,
          title,
          description,
          category,
          status,
          event_date,
          created_at
        ),
        market_options (
          id,
          option_text
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: bets, error: betsError} = await query;

    if (betsError) {
      console.error('Error fetching bets:', betsError);
      // Return empty data instead of error
      return NextResponse.json({
        success: true,
        bets: [],
        stats: {
          total: 0,
          won: 0,
          lost: 0,
          pending: 0,
          winRate: 0,
          roi: 0,
          totalInvested: 0,
          totalReturns: 0,
          netProfit: 0,
          bestCategory: 'N/A',
          currentStreak: { count: 0, type: null },
        },
        categoriesStats: [],
        timeSeriesData: [],
      });
    }

    // Filter by category if specified
    let filteredBets = bets || [];
    if (category) {
      filteredBets = filteredBets.filter((bet: any) => bet.markets?.category === category);
    }

    // Calculate overall stats
    const totalBets = filteredBets.length;
    const wonBets = filteredBets.filter((b: any) => b.status === 'won').length;
    const lostBets = filteredBets.filter((b: any) => b.status === 'lost').length;
    const pendingBets = filteredBets.filter((b: any) => b.status === 'pending').length;
    const winRate = totalBets > 0 ? ((wonBets / (wonBets + lostBets || 1)) * 100).toFixed(2) : '0.00';

    // Calculate ROI
    const totalInvested = filteredBets.reduce((sum: number, b: any) => sum + (b.amount || 0), 0);
    const totalReturns = filteredBets
      .filter((b: any) => b.status === 'won')
      .reduce((sum: number, b: any) => sum + (b.net_payout || 0), 0);
    const roi = totalInvested > 0 ? (((totalReturns - totalInvested) / totalInvested) * 100).toFixed(2) : '0.00';

    // Calculate stats by category
    const categoriesMap = new Map();
    filteredBets.forEach((bet: any) => {
      const cat = bet.markets?.category || 'other';
      if (!categoriesMap.has(cat)) {
        categoriesMap.set(cat, { total: 0, won: 0, lost: 0 });
      }
      const catStats = categoriesMap.get(cat);
      catStats.total += 1;
      if (bet.status === 'won') catStats.won += 1;
      if (bet.status === 'lost') catStats.lost += 1;
    });

    const categoriesStats = Array.from(categoriesMap.entries()).map(([category, stats]: [string, any]) => ({
      category,
      total: stats.total,
      won: stats.won,
      lost: stats.lost,
      winRate: stats.total > 0 ? ((stats.won / (stats.won + stats.lost || 1)) * 100).toFixed(2) : '0.00',
    }));

    // Find best category
    const bestCategory = categoriesStats.reduce(
      (best, curr) => {
        const currWinRate = parseFloat(curr.winRate);
        return currWinRate > best.winRate ? { category: curr.category, winRate: currWinRate } : best;
      },
      { category: 'N/A', winRate: 0 }
    );

    // Calculate current streak
    let currentStreak = 0;
    let streakType: 'won' | 'lost' | null = null;
    const sortedBets = [...filteredBets]
      .filter((b: any) => b.status === 'won' || b.status === 'lost')
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    for (const bet of sortedBets) {
      if (!streakType) {
        streakType = bet.status as 'won' | 'lost';
        currentStreak = 1;
      } else if (bet.status === streakType) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate profit/loss over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const timeSeriesData = filteredBets
      .filter((b: any) => new Date(b.created_at) >= thirtyDaysAgo)
      .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .reduce((acc: any[], bet: any) => {
        const date = new Date(bet.created_at).toISOString().split('T')[0];
        const profit = bet.status === 'won' ? (bet.net_payout || 0) - bet.amount : bet.status === 'lost' ? -bet.amount : 0;

        const existing = acc.find((item) => item.date === date);
        if (existing) {
          existing.profit += profit;
        } else {
          acc.push({ date, profit });
        }
        return acc;
      }, []);

    // Calculate cumulative profit
    let cumulative = 0;
    const cumulativeData = timeSeriesData.map((item) => {
      cumulative += item.profit;
      return { ...item, cumulative };
    });

    return NextResponse.json({
      success: true,
      bets: filteredBets,
      stats: {
        total: totalBets,
        won: wonBets,
        lost: lostBets,
        pending: pendingBets,
        winRate: parseFloat(winRate),
        roi: parseFloat(roi),
        totalInvested,
        totalReturns,
        netProfit: totalReturns - totalInvested,
        bestCategory: bestCategory.category,
        currentStreak: {
          count: currentStreak,
          type: streakType,
        },
      },
      categoriesStats,
      timeSeriesData: cumulativeData,
    });
  } catch (error) {
    console.error('Error in pools history GET:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
