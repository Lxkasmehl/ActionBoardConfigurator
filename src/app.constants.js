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
      x: window.innerWidth / 2 - 350,
      y: window.innerHeight / 2 - 55,
    },
    type: 'EntitySection',
  },
];
