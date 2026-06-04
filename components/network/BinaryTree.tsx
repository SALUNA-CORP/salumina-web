'use client';

import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface TreeNode {
  id: string;
  email: string;
  full_name: string | null;
  status: string;
  left: TreeNode | null;
  right: TreeNode | null;
}

interface BinaryTreeProps {
  userId: string;
}

export function BinaryTree({ userId }: BinaryTreeProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);

  const buildFlowNodes = useCallback((tree: TreeNode, x = 0, y = 0, level = 0): { nodes: Node[]; edges: Edge[] } => {
    const spacing = 200 / (level + 1);
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Current node
    nodes.push({
      id: tree.id,
      type: 'default',
      position: { x, y },
      data: {
        label: (
          <div className="text-center">
            <p className="font-semibold text-sm">{tree.full_name || 'Usuario'}</p>
            <p className="text-xs text-gray-500">{tree.email}</p>
            <span className={`text-xs px-2 py-1 rounded-full ${
              tree.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {tree.status}
            </span>
          </div>
        ),
      },
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
    });

    // Left child
    if (tree.left) {
      const leftResult = buildFlowNodes(tree.left, x - spacing, y + 150, level + 1);
      nodes.push(...leftResult.nodes);
      edges.push(...leftResult.edges);
      edges.push({
        id: `${tree.id}-${tree.left.id}`,
        source: tree.id,
        target: tree.left.id,
        type: 'smoothstep',
        label: 'Left',
        style: { stroke: '#3b82f6' },
      });
    }

    // Right child
    if (tree.right) {
      const rightResult = buildFlowNodes(tree.right, x + spacing, y + 150, level + 1);
      nodes.push(...rightResult.nodes);
      edges.push(...rightResult.edges);
      edges.push({
        id: `${tree.id}-${tree.right.id}`,
        source: tree.id,
        target: tree.right.id,
        type: 'smoothstep',
        label: 'Right',
        style: { stroke: '#10b981' },
      });
    }

    return { nodes, edges };
  }, []);

  useEffect(() => {
    async function loadTree() {
      try {
        const response = await fetch(`/api/network/tree?userId=${userId}&depth=4`);
        const data = await response.json();

        if (data.success && data.tree) {
          const { nodes: flowNodes, edges: flowEdges } = buildFlowNodes(data.tree, 400, 50);
          setNodes(flowNodes);
          setEdges(flowEdges);
        }
      } catch (error) {
        console.error('Error loading tree:', error);
      } finally {
        setLoading(false);
      }
    }

    loadTree();
  }, [userId, buildFlowNodes, setNodes, setEdges]);

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">Cargando árbol binario...</p>
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">No hay datos para mostrar</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] bg-gray-50 rounded-lg border border-gray-200">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
