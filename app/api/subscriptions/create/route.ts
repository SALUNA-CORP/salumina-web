import { createClient } from '@/lib/supabase/server';
import { createCheckoutSession } from '@/lib/payments/stripe';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const { bookmakerIds, currency } = await request.json();

    if (!bookmakerIds || bookmakerIds.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Debes seleccionar al menos una casa de apuestas' },
        { status: 400 }
      );
    }

    const session = await createCheckoutSession({
      userId: user.id,
      userEmail: user.email!,
      bookmakerIds,
      currency,
    });

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
    });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
