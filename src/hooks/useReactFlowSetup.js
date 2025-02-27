import { useReactFlow } from '@xyflow/react';

export function useReactFlowSetup(id) {
  const { setNodes, getEdges } = useReactFlow();

  const removeNodeById = () => {
    setNodes((prevNodes) => prevNodes.filter((node) => node.id !== id));
  };

  const isTargetOfEdge = () => {
    const edges = getEdges();
    return edges.some((edge) => edge.target === id);
  };

  return { removeNodeById, isTargetOfEdge };
}
