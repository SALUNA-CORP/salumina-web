import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { CreateMarketForm } from '@/components/pools/admin/CreateMarketForm';

export default async function CreateMarketPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user is admin
  const { data: userData } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userData?.role !== 'superadmin') {
    redirect('/dashboard');
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Crear Mercado</h1>
        <p className="text-gray-500 mt-1">Crea un nuevo evento de apuestas</p>
      </div>

      <CreateMarketForm />
    </div>
  );
}
