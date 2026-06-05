import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// GET - List all training materials (admin)
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

    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'superadmin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { data: materials, error } = await supabaseAdmin
      .from('training_materials')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching materials:', error);
      return NextResponse.json({ error: 'Error al obtener materiales' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      materials: materials || [],
    });
  } catch (error) {
    console.error('Error in admin training GET:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// POST - Create training material (admin)
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
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'superadmin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      content_type,
      category,
      difficulty,
      content_url,
      content_text,
      duration_minutes,
      thumbnail_url,
    } = body;

    // Validate required fields
    if (!title || !content_type || !category || !difficulty) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const { data: material, error } = await supabaseAdmin
      .from('training_materials')
      .insert({
        title,
        description,
        content_type,
        category,
        difficulty,
        content_url,
        content_text,
        duration_minutes: duration_minutes || 0,
        thumbnail_url,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating material:', error);
      return NextResponse.json({ error: 'Error al crear material' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      material,
    });
  } catch (error) {
    console.error('Error in admin training POST:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// DELETE - Delete training material (admin)
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

    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'superadmin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const materialId = searchParams.get('id');

    if (!materialId) {
      return NextResponse.json({ error: 'Falta ID del material' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('training_materials')
      .delete()
      .eq('id', materialId);

    if (error) {
      console.error('Error deleting material:', error);
      return NextResponse.json({ error: 'Error al eliminar material' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Material eliminado',
    });
  } catch (error) {
    console.error('Error in admin training DELETE:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
