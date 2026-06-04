import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';

export default async function CommissionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get commissions
  const { data: commissions } = await supabase
    .from('commissions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const available = commissions?.filter((c) => c.status === 'available').reduce((sum, c) => sum + Number(c.amount), 0) || 0;
  const withdrawn = commissions?.filter((c) => c.status === 'withdrawn').reduce((sum, c) => sum + Number(c.amount), 0) || 0;
  const total = commissions?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;

  const direct = commissions?.filter((c) => c.type === 'direct').reduce((sum, c) => sum + Number(c.amount), 0) || 0;
  const binary = commissions?.filter((c) => c.type === 'binary').reduce((sum, c) => sum + Number(c.amount), 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Comisiones</h1>
        <p className="text-gray-500 mt-1">Historial y balance de comisiones</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Saldo Disponible
            </CardTitle>
            <DollarSign className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${available.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">Listo para retiro</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Ganado
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${total.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">Comisiones totales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Comisiones Directas
            </CardTitle>
            <DollarSign className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${direct.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">De referidos directos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Comisiones Binarias
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${binary.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">De red binaria</p>
          </CardContent>
        </Card>
      </div>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Comisiones</CardTitle>
        </CardHeader>
        <CardContent>
          {commissions && commissions.length > 0 ? (
            <div className="space-y-2">
              {commissions.map((comm) => (
                <div
                  key={comm.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {comm.type === 'direct' ? 'Comisión Directa' : `Comisión Binaria - Nivel ${comm.level}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(comm.created_at).toLocaleDateString()}
                    </p>
                    {comm.leg && (
                      <span className="text-xs text-gray-400">
                        Pierna {comm.leg === 'left' ? 'Izquierda' : 'Derecha'}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">+${Number(comm.amount).toFixed(2)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      comm.status === 'available' ? 'bg-green-100 text-green-800' :
                      comm.status === 'withdrawn' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {comm.status === 'available' ? 'Disponible' :
                       comm.status === 'withdrawn' ? 'Retirado' : 'Pendiente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No tienes comisiones aún</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
