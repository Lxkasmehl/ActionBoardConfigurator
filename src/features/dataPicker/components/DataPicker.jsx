import { useCallback, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { IconButton, CircularProgress, Button } from '@mui/joy';
import useFetchEntities from '../../../shared/hooks/useFetchEntities.js';
import { useSendRequest } from '../hooks/useSendRequest.js';
import { formatUtils } from '../utils/odata/oDataQueries.js';
import PropTypes from 'prop-types';

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

export default function DataPicker({
  containerRef,
  onNodeSelected,
  onDataFetch,
  onWarning,
  triggerFetch,
}) {
  const loading = useFetchEntities();
  const dispatch = useDispatch();
  const allEntities = useSelector((state) => state.fetchedData.allEntities);

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

  const handleSendRequest = useSendRequest(config);

  const transformConfigEntries = useCallback(
    (nodeConfig) => {
      const [entityName, entityConfig] = Object.entries(nodeConfig)[0];
      const currentEntity = allEntities.find((e) => e.name === entityName);

      // First, filter out base properties that have extended versions
      const filteredProperties = entityConfig.selectedProperties.filter(
        (prop) => {
          const parts = prop.split('/');
          const baseProperty = parts[0];

          // Check if there's any other property that starts with this base property
          return !entityConfig.selectedProperties.some(
            (otherProp) =>
              otherProp !== prop && otherProp.startsWith(`${baseProperty}/`),
          );
        },
      );

      // Group properties by their final property name (after the last slash)
      const groupedProperties = filteredProperties.reduce((acc, prop) => {
        const parts = prop.split('/');
        const finalProperty = parts[parts.length - 1];
        const navigationPath = parts.slice(0, -1);

        if (!acc[finalProperty]) {
          acc[finalProperty] = {
            name: finalProperty,
            navigationProperties: [],
          };
        }

        if (navigationPath.length > 0) {
          // Build up the navigation properties array from left to right
          let currentPath = '';

          navigationPath.forEach((navProp) => {
            currentPath = currentPath ? `${currentPath}/${navProp}` : navProp;

            // Find the actual navigation property metadata
            const navProperty =
              currentEntity?.properties?.navigationProperties?.find(
                (np) => np.Name === navProp,
              );

            if (navProperty) {
              acc[finalProperty].navigationProperties.push(navProperty);
            }
          });
        }

        return acc;
      }, {});

      return {
        [entityName]: {
          ...entityConfig,
          selectedProperties: Object.values(groupedProperties),
        },
      };
    },
    [allEntities],
  );

  const handleRequest = useCallback(
    async (showModal = true) => {
      setIsLoading(true);
      if (showModal) {
        setModalOpen(true);
      }
      try {
        const results = await handleSendRequest();
        const formattedResults = formatUtils.formatODataResult(results);
        setResults(formattedResults);

        const configEntries = selectedNode
          ? [[selectedNode, transformConfigEntries(config[selectedNode])]]
          : Object.entries(config).map(([nodeId, nodeConfig]) => [
              nodeId,
              transformConfigEntries(nodeConfig),
            ]);

        onDataFetch({
          results: formattedResults,
          configEntries,
        });
      } catch (error) {
        console.error('Error handling request:', error);
        setResults({ error: 'An error occurred' });
        onWarning('An error occurred while fetching data');
      } finally {
        setIsLoading(false);
      }
    },
    [
      handleSendRequest,
      selectedNode,
      config,
      transformConfigEntries,
      onDataFetch,
      onWarning,
    ],
  );

  useEffect(() => {
    if (selectedNode && onNodeSelected) {
      onNodeSelected(selectedNode, selectedEntities[selectedNode]);
    }
  }, [selectedNode, selectedEntities, onNodeSelected]);

  useEffect(() => {
    if (triggerFetch) {
      handleRequest(false);
    }
  }, [triggerFetch, handleRequest]);

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
      const containerWidth =
        containerRef?.current?.clientWidth || window.innerWidth;
      const containerHeight =
        containerRef?.current?.clientHeight || window.innerHeight;

      setNodes(() => {
        const configKeys = Object.keys(config);

        const entityNodes = configKeys.map((id, index) => {
          let nodeX = containerWidth / 2 - 320 + index * 120;
          let nodeY = containerHeight / 2 - 55 + index * 120;

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
              x: containerWidth / 2 - 100,
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
    const containerWidth =
      containerRef?.current?.clientWidth || window.innerWidth;
    const containerHeight =
      containerRef?.current?.clientHeight || window.innerHeight;

    let newX = containerWidth / 2 - 320;
    let newY = containerHeight / 2 - 55;

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
  }, [createNodeId, nodes, setNodes, containerRef]);

  if (loading) {
    return (
      <div className='flex justify-center items-center w-full h-screen'>
        <CircularProgress size='lg' />
      </div>
    );
  }

  return (
    <div className='w-full h-screen' ref={containerRef}>
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
        onClick={() => handleRequest(true)}
        variant='solid'
        color='neutral'
        size='lg'
        sx={{
          position: 'absolute',
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
          position: 'absolute',
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

DataPicker.propTypes = {
  containerRef: PropTypes.shape({
    current: PropTypes.shape({
      clientWidth: PropTypes.number,
      clientHeight: PropTypes.number,
    }),
  }).isRequired,
  onNodeSelected: PropTypes.func,
  onDataFetch: PropTypes.func,
  onWarning: PropTypes.func,
  triggerFetch: PropTypes.bool,
};

DataPicker.defaultProps = {
  onNodeSelected: () => {},
  onDataFetch: () => {},
  onWarning: () => {},
  triggerFetch: false,
};
