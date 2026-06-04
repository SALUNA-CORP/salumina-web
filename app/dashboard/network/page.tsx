import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BinaryTree } from '@/components/network/BinaryTree';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp } from 'lucide-react';

export default async function NetworkPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user's network stats
  const { count: leftCount } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('placement_parent_id', user.id)
    .eq('leg', 'left');

  const { count: rightCount } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('placement_parent_id', user.id)
    .eq('leg', 'right');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Red Binaria</h1>
        <p className="text-gray-500 mt-1">Visualiza tu estructura de referidos</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pierna Izquierda
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{leftCount || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Usuarios en pierna izq</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pierna Derecha
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{rightCount || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Usuarios en pierna der</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Red
            </CardTitle>
            <Users className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {(leftCount || 0) + (rightCount || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">En tus piernas directas</p>
          </CardContent>
        </Card>
      </div>

      {/* Binary Tree Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Árbol Binario</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Visualización de tu estructura de red (4 niveles)
          </p>
        </CardHeader>
        <CardContent>
          <BinaryTree userId={user.id} />
        </CardContent>
      </Card>
    </div>
  );
}
