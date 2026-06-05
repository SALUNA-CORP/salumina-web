import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// GET - List user's alerts with market details
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

    const { data: alerts, error } = await supabaseAdmin
      .from('market_alerts')
      .select(`
        *,
        markets (
          id,
          title,
          category,
          status,
          event_date,
          pool_total,
          created_at
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching alerts:', error);
      return NextResponse.json({ error: 'Error al obtener alertas' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      alerts: alerts || [],
    });
  } catch (error) {
    console.error('Error in alerts GET:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// POST - Create new alert
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

    const body = await request.json();
    const { market_id, alert_type, threshold_value, notification_method } = body;

    // Validate required fields
    if (!market_id || !alert_type) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    // Validate alert_type
    const validTypes = ['odds_change', 'pool_threshold', 'closing_soon', 'status_change'];
    if (!validTypes.includes(alert_type)) {
      return NextResponse.json({ error: 'Tipo de alerta inválido' }, { status: 400 });
    }

    // Create alert
    const { data: alert, error } = await supabaseAdmin
      .from('market_alerts')
      .insert({
        user_id: user.id,
        market_id,
        alert_type,
        threshold_value,
        notification_method: notification_method || 'in_app',
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating alert:', error);
      return NextResponse.json({ error: 'Error al crear alerta' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      alert,
    });
  } catch (error) {
    console.error('Error in alerts POST:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// DELETE - Remove alert
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
    const alertId = searchParams.get('alert_id');

    if (!alertId) {
      return NextResponse.json({ error: 'Falta alert_id' }, { status: 400 });
    }

    // Delete only if belongs to user
    const { error } = await supabaseAdmin
      .from('market_alerts')
      .delete()
      .eq('id', alertId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting alert:', error);
      return NextResponse.json({ error: 'Error al eliminar alerta' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Alerta eliminada',
    });
  } catch (error) {
    console.error('Error in alerts DELETE:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// PATCH - Toggle alert active status
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { alert_id, is_active } = body;

    if (!alert_id || typeof is_active !== 'boolean') {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const { data: alert, error } = await supabaseAdmin
      .from('market_alerts')
      .update({ is_active })
      .eq('id', alert_id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating alert:', error);
      return NextResponse.json({ error: 'Error al actualizar alerta' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      alert,
    });
  } catch (error) {
    console.error('Error in alerts PATCH:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
