import { supabaseAdmin } from '@/lib/supabase/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NetworkTreeVisualization } from '@/components/network/NetworkTreeVisualization';
import { NetworkStats } from '@/components/admin/NetworkStats';
import { NetworkSearch } from '@/components/admin/NetworkSearch';

interface SearchParams {
  userId?: string;
}

export default async function AdminNetworkPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const targetUserId = params.userId;

  // Get all users for the network
  const { data: allUsers } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: true });

  // Get network stats
  const totalUsers = allUsers?.length || 0;
  const activeUsers = allUsers?.filter(u => u.status === 'approved').length || 0;
  const pendingUsers = allUsers?.filter(u => u.status === 'pending').length || 0;

  // Calculate network depth
  let maxDepth = 0;
  const calculateDepth = (userId: string, depth = 0): number => {
    const children = allUsers?.filter(u => u.placement_parent_id === userId) || [];
    if (children.length === 0) return depth;
    return Math.max(...children.map(c => calculateDepth(c.id, depth + 1)));
  };

  const rootUsers = allUsers?.filter(u => !u.placement_parent_id) || [];
  rootUsers.forEach(user => {
    const depth = calculateDepth(user.id, 1);
    if (depth > maxDepth) maxDepth = depth;
  });

  // Get target user info if specified
  let targetUser = null;
  if (targetUserId) {
    const { data } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', targetUserId)
      .single();
    targetUser = data;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Red Binaria Global</h1>
          <p className="text-gray-500 mt-1">
            Visualización completa de la estructura MLM
          </p>
        </div>
      </div>

      {/* Network Stats */}
      <NetworkStats
        totalUsers={totalUsers}
        activeUsers={activeUsers}
        pendingUsers={pendingUsers}
        maxDepth={maxDepth}
      />

      {/* Search */}
      <NetworkSearch users={allUsers || []} />

      {/* Current View Info */}
      {targetUser && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Vista Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Usuario:</span>
                <span className="ml-2 font-semibold">{targetUser.full_name}</span>
              </div>
              <div>
                <span className="text-gray-600">Email:</span>
                <span className="ml-2 font-semibold">{targetUser.email}</span>
              </div>
              <div>
                <span className="text-gray-600">Código:</span>
                <span className="ml-2 font-mono font-semibold">{targetUser.referral_code}</span>
              </div>
              <div>
                <span className="text-gray-600">Estado:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                  targetUser.status === 'approved' ? 'bg-green-100 text-green-800' :
                  targetUser.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {targetUser.status === 'approved' ? 'Activo' :
                   targetUser.status === 'pending' ? 'Pendiente' : 'Inactivo'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Network Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Visualización de Red</CardTitle>
        </CardHeader>
        <CardContent>
          <NetworkTreeVisualization
            users={allUsers || []}
            initialUserId={targetUserId}
            isAdmin={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}
