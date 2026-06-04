import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CopyButton } from '@/components/referrals/CopyButton';
import { Users } from 'lucide-react';

export default async function ReferralsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('referral_code')
    .eq('id', user.id)
    .single();

  // Get direct referrals
  const { data: referrals } = await supabase
    .from('user_profiles')
    .select('id, email, full_name, status, created_at')
    .eq('sponsor_id', user.id)
    .order('created_at', { ascending: false });

  const referralLink = `${process.env.NEXT_PUBLIC_BASE_URL}/register?ref=${profile?.referral_code}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Referidos</h1>
        <p className="text-gray-500 mt-1">Gestiona tus referidos directos</p>
      </div>

      {/* Referral Code Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Tu Código de Referido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-white rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Código único:</p>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-mono font-bold text-blue-600">
                {profile?.referral_code}
              </p>
              <CopyButton text={profile?.referral_code || ''} label="Código copiado" />
            </div>
          </div>

          <div className="p-4 bg-white rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Link de referido:</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm"
              />
              <div className="[&_button]:bg-blue-600 [&_button]:hover:bg-blue-700 [&_button]:text-white">
                <CopyButton text={referralLink} label="Link copiado" />
              </div>
            </div>
          </div>

          <p className="text-sm text-blue-700">
            Comparte este link con nuevos usuarios para que se registren con tu código
          </p>
        </CardContent>
      </Card>

      {/* Referrals List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Mis Referidos Directos</CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{referrals?.length || 0} referidos</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {referrals && referrals.length > 0 ? (
            <div className="space-y-3">
              {referrals.map((ref) => (
                <div
                  key={ref.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{ref.full_name || 'Usuario'}</p>
                    <p className="text-sm text-gray-500">{ref.email}</p>
                    <p className="text-xs text-gray-400">
                      Registrado: {new Date(ref.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    ref.status === 'approved' ? 'bg-green-100 text-green-800' :
                    ref.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {ref.status === 'approved' ? 'Activo' :
                     ref.status === 'pending' ? 'Pendiente' : 'Inactivo'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Aún no has referido a nadie. ¡Comparte tu código para empezar!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
