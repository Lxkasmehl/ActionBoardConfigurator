import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { IconButton } from '@mui/joy';
import useFetchEntities from './hooks/useFetchEntities.js';

import { INITIAL_NODES, NODE_TYPES } from './app.constants.js';
import {
  addEntity,
  setPropertySelection,
  setFilter,
} from './redux/entitiesSlice.js';

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

export default function App() {
  const loading = useFetchEntities();
  const config = useSelector((state) => state.entities.config);
  const dispatch = useDispatch();

  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const selectedEntities = useSelector(
    (state) => state.entities.selectedEntities,
  );
  const selectedProperties = useSelector(
    (state) => state.entities.selectedProperties,
  );
  const unofficialFilter = useSelector(
    (state) => state.entities.unofficialFilter,
  );

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

    const newNode = {
      id: crypto.randomUUID(),
      position: { x: newX, y: newY },
      type: 'EntitySection',
    };
    setNodes((prev) => [...prev, newNode]);

    console.log(config);
  };

  const onConnectWithEntityRender = useCallback(
    (connection) => {
      onConnect(connection);

      if (connection.target) {
        const targetNodeId = connection.target;

        const targetNode = nodes.find((node) => node.id === targetNodeId);
        if (targetNode && targetNode.type === 'EntitySection') {
          dispatch(
            addEntity({
              id: targetNodeId,
              entityName: selectedEntities[targetNodeId],
            }),
          );
          dispatch(
            setPropertySelection({
              entityName: selectedEntities[targetNodeId],
              id: targetNodeId,
              propertyNames: selectedProperties[targetNodeId],
            }),
          );
          dispatch(
            setFilter({
              id: targetNodeId,
              entityName: selectedEntities[targetNodeId],
              filterObject: unofficialFilter[targetNodeId],
            }),
          );
        }
      }
    },
    [
      onConnect,
      nodes,
      dispatch,
      selectedEntities,
      selectedProperties,
      unofficialFilter,
    ],
  );

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
        onConnect={onConnectWithEntityRender}
        nodeTypes={NODE_TYPES}
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
