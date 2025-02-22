import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { IconButton } from '@mui/joy';
import useFetchEntities from './hooks/useFetchEntities.js';

import { INITIAL_NODES, NODE_TYPES } from './app.constants.js';
import {
  addEntity,
  setPropertySelection,
  setEntityFilter,
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
  const dispatch = useDispatch();

  const { config, selectedEntities, selectedProperties, customFilters } =
    useSelector((state) => state.entities);

  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const createNodeId = useCallback(() => crypto.randomUUID(), []);

  const onConnect = useCallback(
    (connection) => {
      const edge = { ...connection, id: createNodeId() };
      setEdges((prevEdges) => addEdge(edge, prevEdges));
    },
    [createNodeId, setEdges],
  );

  const addSection = useCallback(() => {
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
      id: createNodeId(),
      position: { x: newX, y: newY },
      type: 'EntitySection',
    };
    setNodes((prev) => [...prev, newNode]);
    console.log(config);
  }, [createNodeId, config, nodes, setNodes]);

  const onConnectWithEntityRender = useCallback(
    (connection) => {
      onConnect(connection);

      if (connection.target) {
        const targetNodeId = connection.target;
        const targetNode = nodes.find((node) => node.id === targetNodeId);

        if (targetNode && targetNode.type === 'EntitySection') {
          const selectedEntity = selectedEntities[targetNodeId];
          if (selectedEntity) {
            dispatch(
              addEntity({ id: targetNodeId, entityName: selectedEntity }),
            );
            dispatch(
              setPropertySelection({
                entityName: selectedEntity,
                id: targetNodeId,
                propertyNames: selectedProperties[targetNodeId],
              }),
            );
            dispatch(
              setEntityFilter({
                id: targetNodeId,
                entityName: selectedEntity,
                filterObject: customFilters[targetNodeId],
              }),
            );
          }
        }
      }
    },
    [
      onConnect,
      nodes,
      dispatch,
      selectedEntities,
      selectedProperties,
      customFilters,
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
