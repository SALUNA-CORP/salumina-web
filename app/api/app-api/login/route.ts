import { createClient } from '@/lib/supabase/server';
import { signAppToken } from '@/lib/jwt/app-jwt';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email y contraseña requeridos' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Authenticate user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { success: false, message: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    const userId = authData.user.id;

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('status')
      .eq('id', userId)
      .single();

    if (!profile || profile.status !== 'approved') {
      return NextResponse.json(
        {
          success: false,
          message: 'Tu cuenta no está activa. Contacta con soporte.',
        },
        { status: 403 }
      );
    }

    // Get active subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id, current_period_end, status, subscription_bookmakers(bookmaker_id, bookmakers(slug))')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    let bookmakers: string[] = [];
    let expiresAt = new Date().toISOString();
    let status: 'active' | 'expired' | 'inactive' = 'inactive';

    if (subscription) {
      // Check if subscription is still valid
      const now = new Date();
      const expiry = new Date(subscription.current_period_end);

      if (now < expiry) {
        status = 'active';
        expiresAt = subscription.current_period_end;
        bookmakers = subscription.subscription_bookmakers?.map(
          (sb: any) => sb.bookmakers.slug
        ) || [];
      } else {
        status = 'expired';
      }
    }

    // Generate JWT
    const token = await signAppToken({
      userId,
      email,
      bookmakers,
      expiresAt,
      status,
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: userId,
        email,
        bookmakers,
        expiresAt,
        status,
      },
    });
  } catch (error: any) {
    console.error('App login error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
