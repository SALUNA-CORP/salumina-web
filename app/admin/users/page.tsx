import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Search, Filter } from 'lucide-react';

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;

  let query = supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  // Filter by status
  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status);
  }

  // Search by email or name
  if (params.search) {
    query = query.or(
      `email.ilike.%${params.search}%,full_name.ilike.%${params.search}%`
    );
  }

  const { data: users } = await query;

  // Get stats
  const { count: totalUsers } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true });

  const { count: pendingUsers } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  const { count: activeUsers } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <p className="text-gray-500 mt-1">Administra todos los usuarios del sistema</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalUsers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Usuarios Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeUsers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pendientes Aprobación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingUsers || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <form method="get" className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="search"
                    placeholder="Buscar por email o nombre..."
                    defaultValue={params.search}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Buscar
                </button>
              </form>
            </div>

            <div className="flex gap-2">
              <Link
                href="/admin/users?status=all"
                className={`px-4 py-2 rounded-lg ${
                  !params.status || params.status === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos
              </Link>
              <Link
                href="/admin/users?status=pending"
                className={`px-4 py-2 rounded-lg ${
                  params.status === 'pending'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pendientes
              </Link>
              <Link
                href="/admin/users?status=approved"
                className={`px-4 py-2 rounded-lg ${
                  params.status === 'approved'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Activos
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Usuarios ({users?.length || 0} {params.status ? `- ${params.status}` : ''})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Usuario
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Rol
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Estado
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Código Ref
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                    Fecha
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users?.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900">
                        {user.full_name || 'Sin nombre'}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={user.role === 'superadmin' ? 'default' : 'secondary'}>
                        {user.role === 'superadmin' ? 'Admin' : 'Usuario'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          user.status === 'approved'
                            ? 'success'
                            : user.status === 'pending'
                            ? 'warning'
                            : 'destructive'
                        }
                      >
                        {user.status === 'approved'
                          ? 'Activo'
                          : user.status === 'pending'
                          ? 'Pendiente'
                          : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {user.referral_code}
                      </code>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-600">
                        {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Ver detalle →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!users || users.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No se encontraron usuarios</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
