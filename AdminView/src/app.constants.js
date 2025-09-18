import EntitySection from './features/dataPicker/components/EntitySection.jsx';
import FlowStart from './features/dataPicker/components/FlowStart.jsx';
import ButtonEdge from './features/dataPicker/components/ButtonEdge.jsx';

export const INITIAL_NODES = [
  {
    id: '0',
    position: {
      x: window.innerWidth / 2 - 100,
      y: 50,
    },
    type: 'FlowStart',
    draggable: false,
  },
  {
    id: crypto.randomUUID(),
    position: {
      x: window.innerWidth / 2 - 320,
      y: window.innerHeight / 2 - 55,
    },
    type: 'EntitySection',
  },
];

export const NODE_TYPES = {
  EntitySection: EntitySection,
  FlowStart: FlowStart,
};

export const EDGE_TYPES = {
  ButtonEdge: ButtonEdge,
};
