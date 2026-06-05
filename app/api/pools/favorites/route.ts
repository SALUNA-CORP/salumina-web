import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// GET - List user's favorite markets
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

    // Get user's favorites with market details
    const { data: favorites, error } = await supabaseAdmin
      .from('market_favorites')
      .select(`
        id,
        created_at,
        market_id,
        markets (
          id,
          title,
          description,
          category,
          status,
          event_date,
          options,
          pool_stats (*)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching favorites:', error);
      return NextResponse.json({ error: 'Error al obtener favoritos' }, { status: 500 });
    }

    // Calculate stats for each market
    const marketsWithStats = favorites?.map((fav: any) => {
      const market = fav.markets;
      const poolStats = market.pool_stats || [];
      const totalPool = poolStats.reduce((sum: number, ps: any) => sum + Number(ps.total_amount), 0);
      const totalBets = poolStats.reduce((sum: number, ps: any) => sum + Number(ps.total_bets), 0);

      // Calculate odds
      const currentOdds = market.options.map((_: string, index: number) => {
        const optionPool = poolStats.find((ps: any) => ps.option_index === index);
        const optionAmount = optionPool ? Number(optionPool.total_amount) : 0;

        if (totalPool === 0 || optionAmount === 0) {
          return 1.0;
        }

        const odds = totalPool / optionAmount;
        return Math.max(1.01, parseFloat(odds.toFixed(2)));
      });

      return {
        ...market,
        favorite_id: fav.id,
        total_pool: totalPool,
        total_bets: totalBets,
        current_odds: currentOdds,
      };
    }) || [];

    return NextResponse.json({
      success: true,
      favorites: marketsWithStats,
    });
  } catch (error) {
    console.error('Error in favorites GET:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// POST - Add market to favorites
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

    const { market_id } = await request.json();

    if (!market_id) {
      return NextResponse.json({ error: 'market_id requerido' }, { status: 400 });
    }

    // Check if market exists
    const { data: market } = await supabaseAdmin
      .from('markets')
      .select('id')
      .eq('id', market_id)
      .single();

    if (!market) {
      return NextResponse.json({ error: 'Mercado no encontrado' }, { status: 404 });
    }

    // Add to favorites (if not already favorited)
    const { data, error } = await supabaseAdmin
      .from('market_favorites')
      .insert({
        user_id: user.id,
        market_id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // Unique violation - already favorited
        return NextResponse.json({ error: 'Ya está en favoritos' }, { status: 400 });
      }
      console.error('Error adding favorite:', error);
      return NextResponse.json({ error: 'Error al agregar favorito' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      favorite: data,
      message: 'Agregado a favoritos',
    });
  } catch (error) {
    console.error('Error in favorites POST:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// DELETE - Remove market from favorites
export async function DELETE(request: NextRequest) {
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
    const market_id = searchParams.get('market_id');

    if (!market_id) {
      return NextResponse.json({ error: 'market_id requerido' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('market_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('market_id', parseInt(market_id));

    if (error) {
      console.error('Error removing favorite:', error);
      return NextResponse.json({ error: 'Error al quitar favorito' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Quitado de favoritos',
    });
  } catch (error) {
    console.error('Error in favorites DELETE:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
