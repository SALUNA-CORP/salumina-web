import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

// GET - List markets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'active', 'open', 'locked', 'closed', 'resolved'

    let query = supabaseAdmin
      .from('markets')
      .select('id, title, description, category, status, event_date, created_at')
      .order('event_date', { ascending: true });

    // Filter by status
    if (status === 'active') {
      query = query.in('status', ['open', 'locked']);
    } else if (status) {
      query = query.eq('status', status);
    }

    const { data: markets, error } = await query;

    if (error) {
      console.error('Error fetching markets:', error);
      return NextResponse.json({ error: 'Error al obtener mercados' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      markets: markets || [],
    });
  } catch (error) {
    console.error('Error in markets GET:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// POST - Create new market
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

    // Check if user is admin
    const { data: userData } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Solo administradores pueden crear mercados' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      category,
      title,
      description,
      options,
      opens_at,
      closes_at,
      event_date,
      betting_closes_at,
      min_bet,
      max_bet,
      max_total_bet,
    } = body;

    // Validate required fields
    if (!category || !title || !options || options.length < 2) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    if (!opens_at || !closes_at || !event_date) {
      return NextResponse.json(
        { error: 'Las fechas son requeridas' },
        { status: 400 }
      );
    }

    // Create market
    const { data: market, error } = await supabaseAdmin
      .from('markets')
      .insert({
        category,
        title,
        description: description || null,
        options,
        opens_at,
        closes_at,
        event_date,
        betting_closes_at: betting_closes_at || event_date, // Default to event_date if not provided
        min_bet: min_bet || 1,
        max_bet: max_bet || 100,
        max_total_bet: max_total_bet || 500,
        status: 'open',
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating market:', error);
      return NextResponse.json(
        { error: 'Error al crear mercado' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      market,
      message: 'Mercado creado exitosamente',
    });
  } catch (error) {
    console.error('Error in markets POST:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
