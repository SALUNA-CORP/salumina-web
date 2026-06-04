import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Clock, TrendingUp } from 'lucide-react';

interface NetworkStatsProps {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  maxDepth: number;
}

export function NetworkStats({ totalUsers, activeUsers, pendingUsers, maxDepth }: NetworkStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Total Usuarios
          </CardTitle>
          <Users className="w-4 h-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{totalUsers}</div>
          <p className="text-xs text-gray-500 mt-1">
            En toda la red
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Usuarios Activos
          </CardTitle>
          <UserCheck className="w-4 h-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{activeUsers}</div>
          <p className="text-xs text-gray-500 mt-1">
            Aprobados ({Math.round((activeUsers / Math.max(totalUsers, 1)) * 100)}%)
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Pendientes
          </CardTitle>
          <Clock className="w-4 h-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{pendingUsers}</div>
          <p className="text-xs text-gray-500 mt-1">
            Esperando aprobación
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Profundidad Máxima
          </CardTitle>
          <TrendingUp className="w-4 h-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">{maxDepth}</div>
          <p className="text-xs text-gray-500 mt-1">
            Niveles de red
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
