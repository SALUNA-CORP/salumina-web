'use client';

import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { UserNode } from './UserNode';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize2, Users, Share2 } from 'lucide-react';
import { InviteModal } from './InviteModal';

interface User {
  id: string;
  full_name: string;
  email: string;
  referral_code: string;
  status: string;
  sponsor_id: string | null;
  placement_parent_id: string | null;
  placement_leg: 'left' | 'right' | null;
  created_at: string;
}

interface NetworkTreeVisualizationProps {
  users: User[];
  initialUserId?: string;
  isAdmin?: boolean;
}

const nodeTypes = {
  userNode: UserNode,
};

export function NetworkTreeVisualization({
  users,
  initialUserId,
  isAdmin = false,
}: NetworkTreeVisualizationProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [currentRootId, setCurrentRootId] = useState<string | undefined>(initialUserId);

  // Build tree structure
  const buildTree = useCallback((rootId?: string) => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // Find root user
    let rootUser: User | undefined;
    if (rootId) {
      rootUser = users.find((u) => u.id === rootId);
    } else {
      // Find first user without placement_parent_id
      rootUser = users.find((u) => !u.placement_parent_id);
    }

    if (!rootUser) return;

    const levelWidth = 250;
    const levelHeight = 150;

    // Build nodes recursively
    const buildNodeRecursive = (
      user: User,
      level: number,
      position: number,
      totalAtLevel: number
    ) => {
      const x = (position - totalAtLevel / 2) * levelWidth;
      const y = level * levelHeight;

      newNodes.push({
        id: user.id,
        type: 'userNode',
        position: { x, y },
        data: {
          user,
          onSelect: (u: User) => setSelectedUser(u),
          onNavigate: (userId: string) => setCurrentRootId(userId),
          isAdmin,
        },
      });

      // Find children
      const leftChild = users.find(
        (u) => u.placement_parent_id === user.id && u.placement_leg === 'left'
      );
      const rightChild = users.find(
        (u) => u.placement_parent_id === user.id && u.placement_leg === 'right'
      );

      if (leftChild) {
        newEdges.push({
          id: `${user.id}-${leftChild.id}`,
          source: user.id,
          target: leftChild.id,
          type: 'smoothstep',
          animated: leftChild.status === 'approved',
          style: { stroke: '#3b82f6', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#3b82f6',
          },
          label: 'Izq',
          labelStyle: { fill: '#3b82f6', fontSize: 10 },
        });
        buildNodeRecursive(leftChild, level + 1, position * 2 - 0.5, totalAtLevel * 2);
      }

      if (rightChild) {
        newEdges.push({
          id: `${user.id}-${rightChild.id}`,
          source: user.id,
          target: rightChild.id,
          type: 'smoothstep',
          animated: rightChild.status === 'approved',
          style: { stroke: '#10b981', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#10b981',
          },
          label: 'Der',
          labelStyle: { fill: '#10b981', fontSize: 10 },
        });
        buildNodeRecursive(rightChild, level + 1, position * 2 + 0.5, totalAtLevel * 2);
      }
    };

    buildNodeRecursive(rootUser, 0, 0, 1);

    setNodes(newNodes);
    setEdges(newEdges);
  }, [users, isAdmin, setNodes, setEdges]);

  useEffect(() => {
    buildTree(currentRootId);
  }, [buildTree, currentRootId]);

  // Calculate network stats for current view
  const countDescendants = (userId: string): number => {
    let count = 0;
    const children = users.filter((u) => u.placement_parent_id === userId);
    children.forEach((child) => {
      count += 1 + countDescendants(child.id);
    });
    return count;
  };

  const currentUser = users.find((u) => u.id === currentRootId) || users.find((u) => !u.placement_parent_id);
  const descendants = currentUser ? countDescendants(currentUser.id) : 0;

  const leftChild = currentUser
    ? users.find((u) => u.placement_parent_id === currentUser.id && u.placement_leg === 'left')
    : null;
  const rightChild = currentUser
    ? users.find((u) => u.placement_parent_id === currentUser.id && u.placement_leg === 'right')
    : null;

  const leftCount = leftChild ? countDescendants(leftChild.id) + 1 : 0;
  const rightCount = rightChild ? countDescendants(rightChild.id) + 1 : 0;

  return (
    <div className="relative">
      <div className="h-[600px] border-2 border-gray-200 rounded-lg bg-gray-50">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.1}
          maxZoom={2}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true,
          }}
        >
          <Background />
          <Controls />

          {/* Stats Panel */}
          <Panel position="top-left" className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Usuario Actual</p>
                <p className="font-semibold text-gray-900">
                  {currentUser?.full_name || 'Sin selección'}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                <div>
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-lg font-bold text-gray-900">{descendants}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600">Izquierda</p>
                  <p className="text-lg font-bold text-blue-600">{leftCount}</p>
                </div>
                <div>
                  <p className="text-xs text-green-600">Derecha</p>
                  <p className="text-lg font-bold text-green-600">{rightCount}</p>
                </div>
              </div>
            </div>
          </Panel>

          {/* Action Buttons */}
          <Panel position="top-right" className="space-y-2">
            <Button
              size="sm"
              variant="outline"
              className="bg-white"
              onClick={() => setShowInviteModal(true)}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Invitar Usuario
            </Button>
            {currentUser && currentUser.placement_parent_id && (
              <Button
                size="sm"
                variant="outline"
                className="bg-white w-full"
                onClick={() => setCurrentRootId(currentUser.placement_parent_id!)}
              >
                <Users className="w-4 h-4 mr-2" />
                Ver Padre
              </Button>
            )}
            {currentRootId && (
              <Button
                size="sm"
                variant="outline"
                className="bg-white w-full"
                onClick={() => setCurrentRootId(undefined)}
              >
                <Maximize2 className="w-4 h-4 mr-2" />
                Ver Todo
              </Button>
            )}
          </Panel>

          {/* Legend */}
          <Panel position="bottom-right" className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
            <p className="text-xs font-semibold text-gray-700 mb-2">Leyenda</p>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-600">Activo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-gray-600">Pendiente</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span className="text-gray-600">Inactivo</span>
              </div>
              <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                <div className="w-3 h-0.5 bg-blue-500"></div>
                <span className="text-gray-600">Pierna Izq</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-green-500"></div>
                <span className="text-gray-600">Pierna Der</span>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Invite Modal */}
      {currentUser && (
        <InviteModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          user={currentUser}
        />
      )}
    </div>
  );
}
