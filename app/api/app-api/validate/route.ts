import { verifyAppToken } from '@/lib/jwt/app-jwt';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, valid: false, reason: 'no_token' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify token
    const payload = await verifyAppToken(token);

    // Double-check subscription status in database
    const supabase = await createClient();

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status, current_period_end, subscription_bookmakers(bookmaker_id, bookmakers(slug))')
      .eq('user_id', payload.userId)
      .eq('status', 'active')
      .single();

    if (!subscription) {
      return NextResponse.json({
        success: true,
        valid: false,
        reason: 'subscription_expired',
        message: 'Tu suscripción ha vencido',
        renewUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/subscription`,
      });
    }

    // Check if subscription is still valid
    const now = new Date();
    const expiry = new Date(subscription.current_period_end);

    if (now >= expiry) {
      return NextResponse.json({
        success: true,
        valid: false,
        reason: 'subscription_expired',
        message: 'Tu suscripción ha vencido',
        renewUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/subscription`,
      });
    }

    // Get current bookmakers
    const bookmakers = subscription.subscription_bookmakers?.map(
      (sb: any) => sb.bookmakers.slug
    ) || [];

    return NextResponse.json({
      success: true,
      valid: true,
      user: {
        id: payload.userId,
        email: payload.email,
        bookmakers,
        expiresAt: subscription.current_period_end,
        status: 'active',
      },
    });
  } catch (error: any) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      {
        success: false,
        valid: false,
        reason: 'invalid_token',
        message: error.message,
      },
      { status: 401 }
    );
  }
}
