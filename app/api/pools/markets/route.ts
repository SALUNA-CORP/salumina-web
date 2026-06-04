import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import type { CreateMarketRequest } from '@/types/pools';

// GET /api/pools/markets - List all markets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // Filter by status
    const category = searchParams.get('category'); // Filter by category
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabaseAdmin
      .from('markets')
      .select(`
        *,
        pool_stats (
          option_index,
          total_amount,
          total_bets,
          premium_amount,
          free_amount
        )
      `, { count: 'exact' })
      .order('event_date', { ascending: true })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    } else {
      // By default, only show open and locked markets
      query = query.in('status', ['open', 'locked']);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data: markets, error, count } = await query;

    if (error) {
      console.error('Error fetching markets:', error);
      return NextResponse.json(
        { success: false, message: 'Error al obtener mercados' },
        { status: 500 }
      );
    }

    // Calculate total pool and odds for each market
    const marketsWithStats = markets?.map((market) => {
      const poolStats = market.pool_stats || [];
      const totalPool = poolStats.reduce((sum: number, ps: any) => sum + Number(ps.total_amount), 0);
      const totalBets = poolStats.reduce((sum: number, ps: any) => sum + Number(ps.total_bets), 0);

      // Calculate odds for each option
      const currentOdds = market.options.map((_: string, index: number) => {
        const optionPool = poolStats.find((ps: any) => ps.option_index === index);
        const optionAmount = optionPool ? Number(optionPool.total_amount) : 0;

        if (totalPool === 0 || optionAmount === 0) {
          return 1.0; // No bets yet
        }

        // Parimutuel odds: (Total Pool / Option Pool)
        // We'll apply commission later when paying out
        const odds = totalPool / optionAmount;
        return Math.max(1.01, parseFloat(odds.toFixed(2)));
      });

      return {
        ...market,
        pool_stats: poolStats,
        total_pool: totalPool,
        total_bets: totalBets,
        current_odds: currentOdds,
      };
    });

    return NextResponse.json({
      success: true,
      markets: marketsWithStats,
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error in GET /api/pools/markets:', error);
    return NextResponse.json(
      { success: false, message: 'Error del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/pools/markets - Create new market (admin only)
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
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'superadmin') {
      return NextResponse.json(
        { success: false, message: 'Solo administradores pueden crear mercados' },
        { status: 403 }
      );
    }

    const body: CreateMarketRequest = await request.json();

    // Validate
    if (!body.title || !body.options || body.options.length < 2) {
      return NextResponse.json(
        { success: false, message: 'Título y al menos 2 opciones son requeridas' },
        { status: 400 }
      );
    }

    if (body.options.length > 10) {
      return NextResponse.json(
        { success: false, message: 'Máximo 10 opciones permitidas' },
        { status: 400 }
      );
    }

    // Create market
    const { data: market, error: marketError } = await supabaseAdmin
      .from('markets')
      .insert({
        category: body.category,
        title: body.title,
        description: body.description,
        options: body.options,
        opens_at: body.opens_at,
        closes_at: body.closes_at,
        event_date: body.event_date,
        image_url: body.image_url,
        external_id: body.external_id,
        metadata: body.metadata,
        min_bet: body.min_bet || 1,
        max_bet: body.max_bet || 100,
        max_total_bet: body.max_total_bet || 500,
        status: 'open', // Open immediately
        created_by: user.id,
      })
      .select()
      .single();

    if (marketError || !market) {
      console.error('Error creating market:', marketError);
      return NextResponse.json(
        { success: false, message: 'Error al crear mercado' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      market,
      message: 'Mercado creado exitosamente',
    });
  } catch (error) {
    console.error('Error in POST /api/pools/markets:', error);
    return NextResponse.json(
      { success: false, message: 'Error del servidor' },
      { status: 500 }
    );
  }
}
