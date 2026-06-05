import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// GET - List training materials with user progress
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
    const category = searchParams.get('category'); // 'recruitment', 'sales', 'platform', 'success_stories'
    const difficulty = searchParams.get('difficulty'); // 'beginner', 'intermediate', 'advanced'

    // Get training materials
    let query = supabaseAdmin
      .from('training_materials')
      .select('*')
      .eq('is_active', true);

    if (category) {
      query = query.eq('category', category);
    }

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    const { data: materials, error: materialsError } = await query.order('created_at', {
      ascending: false,
    });

    if (materialsError) {
      console.error('Error fetching materials:', materialsError);
      return NextResponse.json({ error: 'Error al obtener materiales' }, { status: 500 });
    }

    // Get user's progress
    const { data: progress } = await supabaseAdmin
      .from('user_training_progress')
      .select('material_id, is_completed, progress_percentage, time_spent_minutes, completed_at')
      .eq('user_id', user.id);

    // Merge data
    const materialsWithProgress = materials?.map((material) => {
      const userProgress = progress?.find((p) => p.material_id === material.id);

      return {
        ...material,
        user_progress: userProgress || null,
      };
    });

    return NextResponse.json({
      success: true,
      materials: materialsWithProgress,
    });
  } catch (error) {
    console.error('Error in training GET:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
