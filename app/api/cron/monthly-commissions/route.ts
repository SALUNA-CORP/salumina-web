import { supabaseAdmin } from '@/lib/supabase/admin';
import { calculateDirectCommission, calculateBinaryCommissions } from '@/lib/commissions/calculator';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting monthly commission calculation...');

    // Get all active users
    const { data: users } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('status', 'approved');

    if (!users) {
      return NextResponse.json({ success: false, message: 'No users found' });
    }

    let totalCommissions = 0;

    // Calculate binary commissions for each user
    for (const user of users) {
      try {
        await calculateBinaryCommissions(user.id);
        totalCommissions++;
      } catch (error) {
        console.error(`Error calculating commissions for user ${user.id}:`, error);
      }
    }

    console.log(`Processed commissions for ${totalCommissions} users`);

    return NextResponse.json({
      success: true,
      message: `Monthly commissions calculated for ${totalCommissions} users`,
      totalUsers: users.length,
      processed: totalCommissions,
    });
  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
