import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Header } from '@/components/shared/Header';
import { Sidebar } from '@/components/shared/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, status, email')
    .eq('id', user.id)
    .single();

  if (!profile || profile.status !== 'approved') {
    redirect('/login');
  }

  if (profile.role === 'superadmin') {
    redirect('/admin');
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="user" />
      <div className="flex-1 flex flex-col">
        <Header user={{ email: profile.email, role: profile.role }} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
