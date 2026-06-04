import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2026-05-27.dahlia',
  typescript: true,
});

export async function createCheckoutSession({
  userId,
  userEmail,
  bookmakerIds,
  currency,
}: {
  userId: string;
  userEmail: string;
  bookmakerIds: number[];
  currency: 'USD' | 'COP';
}) {
  const baseAmount = 20;
  const bookmakerAmount = bookmakerIds.length * 5;
  const totalAmount = baseAmount + bookmakerAmount;

  const session = await stripe.checkout.sessions.create({
    customer_email: userEmail,
    line_items: [
      {
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: 'Salumina - Plan Mensual',
            description: `Plan base + ${bookmakerIds.length} bookmakers`,
          },
          unit_amount: totalAmount * 100,
          recurring: {
            interval: 'month',
          },
        },
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/subscription?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/subscription?canceled=true`,
    metadata: {
      userId,
      bookmakerIds: bookmakerIds.join(','),
      currency,
    },
  });

  return session;
}
