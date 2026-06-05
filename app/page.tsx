import { supabaseAdmin } from '@/lib/supabase/admin';
import { LandingHero } from '@/components/landing/LandingHero';
import { LandingPoolsShowcase } from '@/components/landing/LandingPoolsShowcase';
import { LandingMarketsPreview } from '@/components/landing/LandingMarketsPreview';
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

  // Get open markets for preview
  const { data: markets } = await supabaseAdmin
    .from('markets')
    .select(`
      *,
      pool_stats (*)
    `)
    .eq('status', 'open')
    .order('event_date', { ascending: true })
    .limit(6);

  // Calculate stats for markets
  const marketsWithStats = markets?.map((market) => {
    const poolStats = market.pool_stats || [];
    const totalPool = poolStats.reduce((sum: number, ps: any) => sum + Number(ps.total_amount), 0);
    const totalBets = poolStats.reduce((sum: number, ps: any) => sum + Number(ps.total_bets), 0);

    // Calculate odds
    const currentOdds = market.options.map((_: string, index: number) => {
      const optionPool = poolStats.find((ps: any) => ps.option_index === index);
      const optionAmount = optionPool ? Number(optionPool.total_amount) : 0;

      if (totalPool === 0 || optionAmount === 0) {
        return 1.0;
      }

      const odds = totalPool / optionAmount;
      return Math.max(1.01, parseFloat(odds.toFixed(2)));
    });

    return {
      ...market,
      total_pool: totalPool,
      total_bets: totalBets,
      current_odds: currentOdds,
    };
  }) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <LandingHero />
      <LandingPoolsShowcase />
      <LandingMarketsPreview markets={marketsWithStats} />
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
