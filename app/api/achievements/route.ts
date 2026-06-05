import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// GET - List all achievements with user's unlock status
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
    const category = searchParams.get('category'); // 'pools', 'mlm', 'general'

    // Get all active achievements
    let query = supabaseAdmin
      .from('achievements')
      .select('*')
      .eq('is_active', true);

    if (category) {
      query = query.eq('category', category);
    }

    const { data: achievements, error: achievementsError } = await query.order('rarity');

    if (achievementsError) {
      console.error('Error fetching achievements:', achievementsError);
      return NextResponse.json({ error: 'Error al obtener logros' }, { status: 500 });
    }

    // Get user's unlocked achievements
    const { data: userAchievements } = await supabaseAdmin
      .from('user_achievements')
      .select('achievement_id, unlocked_at, progress')
      .eq('user_id', user.id);

    // Merge data
    const achievementsWithStatus = achievements?.map((achievement) => {
      const userAchievement = userAchievements?.find(
        (ua) => ua.achievement_id === achievement.id
      );

      return {
        ...achievement,
        unlocked: !!userAchievement,
        unlocked_at: userAchievement?.unlocked_at || null,
        progress: userAchievement?.progress || null,
      };
    });

    // Calculate stats
    const totalAchievements = achievements?.length || 0;
    const unlockedCount = userAchievements?.length || 0;
    const byCategory = {
      pools: achievements?.filter((a) => a.category === 'pools').length || 0,
      mlm: achievements?.filter((a) => a.category === 'mlm').length || 0,
      general: achievements?.filter((a) => a.category === 'general').length || 0,
    };

    return NextResponse.json({
      success: true,
      achievements: achievementsWithStatus,
      stats: {
        total: totalAchievements,
        unlocked: unlockedCount,
        locked: totalAchievements - unlockedCount,
        percentage: totalAchievements > 0 ? Math.round((unlockedCount / totalAchievements) * 100) : 0,
        byCategory,
      },
    });
  } catch (error) {
    console.error('Error in achievements GET:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
