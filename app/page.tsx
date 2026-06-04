import { supabaseAdmin } from '@/lib/supabase/admin';
import { LandingHero } from '@/components/landing/LandingHero';
import { LandingFeatures } from '@/components/landing/LandingFeatures';
import { LandingPricing } from '@/components/landing/LandingPricing';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default async function HomePage() {
  // Get pricing configuration
  const { data: config } = await supabaseAdmin
    .from('commission_config')
    .select('base_subscription_price, bookmaker_price')
    .maybeSingle();

  const basePrice = config ? Number(config.base_subscription_price) : 20;
  const bookmakerPrice = config ? Number(config.bookmaker_price) : 5;

  // Get available bookmakers count
  const { count: bookmakersCount } = await supabaseAdmin
    .from('bookmakers')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  const totalBookmakers = bookmakersCount || 3;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <LandingHero />
      <LandingFeatures />
      <LandingPricing
        basePrice={basePrice}
        bookmakerPrice={bookmakerPrice}
        totalBookmakers={totalBookmakers}
      />
      <LandingFooter />
    </div>
  );
}
