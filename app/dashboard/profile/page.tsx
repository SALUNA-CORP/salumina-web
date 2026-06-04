import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Calendar, Key } from 'lucide-react';

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-500 mt-1">Información personal y configuración de cuenta</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Nombre Completo</p>
              <p className="font-medium text-gray-900">{profile?.full_name || 'No especificado'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Código de Referido</p>
              <code className="text-sm bg-gray-100 px-3 py-1 rounded font-mono">
                {profile?.referral_code}
              </code>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha de Registro</p>
              <p className="font-medium text-gray-900">
                {new Date(profile?.created_at || '').toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado de Cuenta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Estado</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                profile?.status === 'approved' ? 'bg-green-100 text-green-800' :
                profile?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {profile?.status === 'approved' ? 'Activa' :
                 profile?.status === 'pending' ? 'Pendiente' : 'Inactiva'}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Rol</p>
              <p className="font-medium text-gray-900">
                {profile?.role === 'superadmin' ? 'Administrador' : 'Usuario'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Acciones</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Para cambiar tu contraseña, usa la opción "¿Olvidaste tu contraseña?" en la página de
            login.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
