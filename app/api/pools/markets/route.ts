import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

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
