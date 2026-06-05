import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

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

    // Get period parameter (default: monthly)
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'monthly'; // 'weekly' or 'monthly'

    // Calculate date range (last 12 periods)
    const now = new Date();
    const periods = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now);
      if (period === 'monthly') {
        date.setMonth(date.getMonth() - i);
        periods.push({
          start: new Date(date.getFullYear(), date.getMonth(), 1),
          end: new Date(date.getFullYear(), date.getMonth() + 1, 0),
          label: date.toLocaleString('es-ES', { month: 'short', year: '2-digit' }),
        });
      } else {
        date.setDate(date.getDate() - (i * 7));
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        periods.push({
          start: weekStart,
          end: weekEnd,
          label: `S${Math.ceil(date.getDate() / 7)}/${date.toLocaleString('es-ES', { month: 'short' })}`,
        });
      }
    }

    // Get all direct referrals
    const { data: allReferrals } = await supabaseAdmin
      .from('user_profiles')
      .select('created_at')
      .eq('referrer_id', user.id)
      .order('created_at', { ascending: true });

    // Get all commissions
    const { data: allCommissions } = await supabaseAdmin
      .from('commissions')
      .select('amount, created_at, type')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    // Calculate data for each period
    const performanceData = periods.map((p) => {
      const newReferrals = allReferrals?.filter((r) => {
        const date = new Date(r.created_at);
        return date >= p.start && date <= p.end;
      }).length || 0;

      const totalCommissions = allCommissions?.reduce((sum, c) => {
        const date = new Date(c.created_at);
        if (date >= p.start && date <= p.end) {
          return sum + Number(c.amount);
        }
        return sum;
      }, 0) || 0;

      // Network size at end of period (cumulative)
      const networkSize = allReferrals?.filter((r) => {
        const date = new Date(r.created_at);
        return date <= p.end;
      }).length || 0;

      return {
        period: p.label,
        newReferrals,
        totalCommissions: Number(totalCommissions.toFixed(2)),
        networkSize,
      };
    });

    // Calculate totals and growth
    const totalReferrals = allReferrals?.length || 0;
    const totalCommissions = allCommissions?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;

    // Get network size (including indirect referrals)
    const { data: networkData } = await supabaseAdmin
      .from('user_network')
      .select('user_id')
      .eq('parent_id', user.id);

    const networkSize = (networkData?.length || 0) + totalReferrals;

    // Calculate growth rate (compare last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const last30DaysReferrals = allReferrals?.filter((r) => {
      const date = new Date(r.created_at);
      return date >= thirtyDaysAgo;
    }).length || 0;

    const previous30DaysReferrals = allReferrals?.filter((r) => {
      const date = new Date(r.created_at);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    }).length || 0;

    const growthRate = previous30DaysReferrals > 0
      ? ((last30DaysReferrals - previous30DaysReferrals) / previous30DaysReferrals) * 100
      : last30DaysReferrals > 0
      ? 100
      : 0;

    const totals = {
      totalReferrals,
      totalCommissions: Number(totalCommissions.toFixed(2)),
      networkSize,
      growthRate: Number(growthRate.toFixed(1)),
    };

    return NextResponse.json({
      success: true,
      data: performanceData,
      totals,
    });
  } catch (error) {
    console.error('Error fetching performance data:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
