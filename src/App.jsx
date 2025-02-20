import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { IconButton } from '@mui/joy';
import useFetchEntities from './hooks/useFetchEntities.js';
import EntitySection from './components/EntitySection.jsx';

import AddIcon from '@mui/icons-material/Add';
import {
  Background,
  Controls,
  ReactFlow,
  useEdgesState,
  useNodesState,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const nodeTypes = {
  EntitySection: EntitySection,
};

export default function App() {
  const loading = useFetchEntities();
  const config = useSelector((state) => state.entities.config);

  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: crypto.randomUUID(),
      position: {
        x: window.innerWidth / 2 - 350,
        y: window.innerHeight / 2 - 55,
      },
      type: 'EntitySection',
    },
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (connection) => {
      const edge = { ...connection, id: crypto.randomUUID() };
      setEdges((prevEdges) => addEdge(edge, prevEdges));
    },
    [setEdges],
  );

  const addSection = () => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let newX = windowWidth / 2 - 320;
    let newY = windowHeight / 2 - 55;

    const occupiedPositions = nodes.map((s) => s.position);
    while (
      occupiedPositions.some(
        (pos) => Math.abs(pos.x - newX) < 700 && Math.abs(pos.y - newY) < 150,
      )
    ) {
      newX += 20;
      newY += 20;
    }

    setNodes((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        position: { x: newX, y: newY },
        type: 'EntitySection',
      },
    ]);

    console.log(config);
    console.log(edges);
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center w-screen h-screen'>
        <div className='animate-spin rounded-full h-24 w-24 border-t-4 border-blue-500'></div>
      </div>
    );
  }

  return (
    <div className='w-full h-screen'>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls />
      </ReactFlow>

      <IconButton
        onClick={addSection}
        variant='solid'
        aria-label='Add new entity section'
        sx={{
          position: 'fixed',
          bottom: '40px',
          right: '40px',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
        }}
      >
        <AddIcon sx={{ fontSize: 32 }} />
      </IconButton>
    </div>
  );
}
