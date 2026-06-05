import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// POST - Update training progress
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { progress_percentage, time_spent_minutes, is_completed } = body;

    const materialId = parseInt(params.id);

    // Check if progress record exists
    const { data: existing } = await supabaseAdmin
      .from('user_training_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('material_id', materialId)
      .single();

    let result;

    if (existing) {
      // Update existing progress
      const updateData: any = {
        progress_percentage,
        time_spent_minutes,
        last_accessed_at: new Date().toISOString(),
      };

      if (is_completed !== undefined) {
        updateData.is_completed = is_completed;
        if (is_completed) {
          updateData.completed_at = new Date().toISOString();
        }
      }

      const { data, error } = await supabaseAdmin
        .from('user_training_progress')
        .update(updateData)
        .eq('id', existing.id)
        .select()
        .single();

      result = { data, error };
    } else {
      // Create new progress record
      const { data, error } = await supabaseAdmin
        .from('user_training_progress')
        .insert({
          user_id: user.id,
          material_id: materialId,
          progress_percentage: progress_percentage || 0,
          time_spent_minutes: time_spent_minutes || 0,
          is_completed: is_completed || false,
          completed_at: is_completed ? new Date().toISOString() : null,
        })
        .select()
        .single();

      result = { data, error };
    }

    if (result.error) {
      console.error('Error updating progress:', result.error);
      return NextResponse.json({ error: 'Error al actualizar progreso' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      progress: result.data,
    });
  } catch (error) {
    console.error('Error in training progress POST:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
