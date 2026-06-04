import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Verify admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const { data: adminProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!adminProfile || adminProfile.role !== 'superadmin') {
      return NextResponse.json({ success: false, message: 'No autorizado' }, { status: 403 });
    }

    const { config, levels } = await request.json();

    // Upsert general config (insert if not exists, update if exists)
    const { data: existingConfig } = await supabaseAdmin
      .from('commission_config')
      .select('id')
      .single();

    if (existingConfig) {
      // Update existing
      const { error: configError } = await supabaseAdmin
        .from('commission_config')
        .update(config)
        .eq('id', existingConfig.id);

      if (configError) throw configError;
    } else {
      // Insert new
      const { error: configError } = await supabaseAdmin
        .from('commission_config')
        .insert(config);

      if (configError) throw configError;
    }

    // Upsert binary levels
    for (const level of levels) {
      const { error: levelError } = await supabaseAdmin
        .from('binary_commission_levels')
        .upsert(
          { level: level.level, percentage: level.percentage },
          { onConflict: 'level' }
        );

      if (levelError) throw levelError;
    }

    return NextResponse.json({
      success: true,
      message: 'Configuración actualizada exitosamente',
    });
  } catch (error: any) {
    console.error('Error updating config:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
