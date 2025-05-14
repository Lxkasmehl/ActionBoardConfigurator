import { useCallback, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { IconButton, CircularProgress, Button } from '@mui/joy';
import useFetchEntities from '../../../shared/hooks/useFetchEntities.js';
import { useSendRequest } from '../hooks/useSendRequest.js';
import { formatUtils } from '../utils/odata/oDataQueries.js';

import {
  INITIAL_NODES,
  NODE_TYPES,
  EDGE_TYPES,
} from '../../../app.constants.js';
import {
  addEntity,
  setPropertySelection,
  setEntityFilter,
  removeEntityConfig,
} from '../../../redux/configSlice.js';
import {
  removeFormData,
  setSelectedProperties,
  setFilterStorageForNodesNotConnectedToEdges,
  setEdgesForFlow,
} from '../../../redux/dataPickerSlice';

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
import ResultsModal from './ResultsModal.jsx';

export default function DataPicker() {
  const loading = useFetchEntities();
  const dispatch = useDispatch();

  const {
    selectedEntities,
    selectedProperties,
    filterStorageForNodesNotConnectedToEdges,
    edgesForFlow,
  } = useSelector((state) => state.dataPicker);

  const { config } = useSelector((state) => state.config);

  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [renderKey, setRenderKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  // Handle initial state from parent
  useEffect(() => {
    const handleInitialState = (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'INIT_IFRAME_STATE') {
        const { config, dataPicker, fetchedData } = event.data.payload;

        // Initialize the store with parent data
        Object.entries(config).forEach(([key, value]) => {
          dispatch({ type: `config/${key}`, payload: value });
        });

        Object.entries(dataPicker).forEach(([key, value]) => {
          dispatch({ type: `dataPicker/${key}`, payload: value });
        });

        Object.entries(fetchedData).forEach(([key, value]) => {
          dispatch({ type: `fetchedData/${key}`, payload: value });
        });
      }
    };

    window.addEventListener('message', handleInitialState);
    return () => window.removeEventListener('message', handleInitialState);
  }, [dispatch]);

  useEffect(() => {
    window.parent.postMessage(
      {
        type: 'SELECTED_NODE_CHANGED',
        payload: {
          nodeId: selectedNode,
          selectedEntity: selectedNode ? selectedEntities[selectedNode] : null,
        },
      },
      window.location.origin,
    );
  }, [selectedNode, selectedEntities]);

  const createNodeId = useCallback(() => crypto.randomUUID(), []);

  const forceRerenderEntitySection = useCallback(() => {
    setRenderKey((prevKey) => prevKey + 1);
  }, []);

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  useEffect(() => {
    if (config && Object.keys(config).length > 0) {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      setNodes(() => {
        const configKeys = Object.keys(config);

        const entityNodes = configKeys.map((id, index) => {
          let nodeX = windowWidth / 2 - 320 + index * 120;
          let nodeY = windowHeight / 2 - 55 + index * 120;

          return {
            id: id,
            position: {
              x: nodeX,
              y: nodeY,
            },
            type: 'EntitySection',
          };
        });

        return [
          {
            id: '0',
            position: {
              x: window.innerWidth / 2 - 100,
              y: 50,
            },
            type: 'FlowStart',
            draggable: false,
          },
          ...entityNodes,
        ];
      });

      if (edgesForFlow?.length > 0) {
        setEdges(edgesForFlow);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (edges?.length > 0) {
      dispatch(setEdgesForFlow(edges));
    }
  }, [edges, dispatch]);

  const onConnect = useCallback(
    (connection) => {
      const edge = { ...connection, id: createNodeId(), type: 'ButtonEdge' };
      setEdges((prevEdges) => addEdge(edge, prevEdges));

      if (connection.target) {
        const targetNodeId = connection.target;
        const targetNode = nodes.find((node) => node.id === targetNodeId);

        if (targetNode && targetNode.type === 'EntitySection') {
          forceRerenderEntitySection();
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
                filterObject:
                  filterStorageForNodesNotConnectedToEdges[targetNodeId],
              }),
            );
          }
        }
      }
    },
    [
      createNodeId,
      setEdges,
      nodes,
      dispatch,
      selectedEntities,
      selectedProperties,
      filterStorageForNodesNotConnectedToEdges,
      forceRerenderEntitySection,
    ],
  );

  const customOnEdgesChange = useCallback(
    (changes) => {
      const change = changes[0];
      if (change.type === 'remove') {
        const edgeToRemove = edges.find((edge) => edge.id === change.id);
        if (edgeToRemove) {
          forceRerenderEntitySection();
          const targetNodeId = edgeToRemove.target;

          if (
            config[targetNodeId] &&
            selectedEntities[targetNodeId] &&
            config[targetNodeId][selectedEntities[targetNodeId]]
          ) {
            const properties =
              config[targetNodeId][selectedEntities[targetNodeId]]
                .selectedProperties;
            const filterObject =
              config[targetNodeId][selectedEntities[targetNodeId]].filter;

            dispatch(
              removeEntityConfig({
                id: targetNodeId,
                entityName: selectedEntities[targetNodeId],
              }),
            );
            dispatch(removeFormData({ id: targetNodeId }));
            dispatch(
              setSelectedProperties({
                id: targetNodeId,
                propertyNames: properties,
              }),
            );
            dispatch(
              setFilterStorageForNodesNotConnectedToEdges({
                id: targetNodeId,
                filterObject,
              }),
            );
          }
        }
      }

      onEdgesChange(changes);
    },
    [
      onEdgesChange,
      edges,
      dispatch,
      config,
      selectedEntities,
      forceRerenderEntitySection,
    ],
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
  }, [createNodeId, nodes, setNodes]);

  const handleSendRequest = useSendRequest(config);

  const handleRequest = async () => {
    setIsLoading(true);
    setModalOpen(true);
    try {
      const results = await handleSendRequest();
      setResults(formatUtils.formatODataResult(results));
    } catch (error) {
      console.error('Error handling request:', error);
      setResults({ error: 'An error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleMessage = async (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'FETCH_DATA_REQUEST') {
        try {
          if (!selectedNode) {
            window.parent.postMessage(
              {
                type: 'IFRAME_WARNING',
                payload: {
                  message:
                    'No node selected. Please select a node before fetching data.',
                  requestId: crypto.randomUUID(),
                },
              },
              window.location.origin,
            );
            return;
          }

          const results = await handleSendRequest(selectedNode);

          const configEntries = selectedNode
            ? [[selectedNode, config[selectedNode]]]
            : Object.entries(config);

          window.parent.postMessage(
            {
              type: 'IFRAME_DATA_RESPONSE',
              payload: {
                results,
                configEntries,
              },
            },
            window.location.origin,
          );
        } catch (error) {
          window.parent.postMessage(
            {
              type: 'IFRAME_ERROR',
              payload: error.message,
            },
            window.location.origin,
          );
        }
      } else if (event.data.type === 'IFRAME_WARNING_RESPONSE') {
        if (event.data.payload.confirmed) {
          try {
            const results = await handleSendRequest();
            window.parent.postMessage(
              {
                type: 'IFRAME_DATA_RESPONSE',
                payload: results,
              },
              window.location.origin,
            );
          } catch (error) {
            window.parent.postMessage(
              {
                type: 'IFRAME_ERROR',
                payload: error.message,
              },
              window.location.origin,
            );
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleSendRequest, selectedNode, config]);

  if (loading) {
    return (
      <div className='flex justify-center items-center w-screen h-screen'>
        <CircularProgress size='lg' />
      </div>
    );
  }

  return (
    <div className='w-full h-screen'>
      <ReactFlow
        nodes={nodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            key: renderKey,
            selected: node.id === selectedNode,
          },
        }))}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={customOnEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        <Controls />
      </ReactFlow>

      <ResultsModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setResults(null);
        }}
        isLoading={isLoading}
        results={results}
      />

      <Button
        data-testid='send-request-button'
        onClick={handleRequest}
        variant='solid'
        color='neutral'
        size='lg'
        sx={{
          position: 'fixed',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        Send Request
      </Button>

      <IconButton
        onClick={addSection}
        variant='solid'
        aria-label='Add new entity section'
        size='lg'
        sx={{
          position: 'fixed',
          bottom: '40px',
          right: '40px',
          borderRadius: '50%',
        }}
      >
        <AddIcon />
      </IconButton>
    </div>
  );
}
