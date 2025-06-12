---
sidebar_position: 3
---

# API Documentation

This documentation describes the internal APIs and data structures used in the WebAppConfigurator.

## Data Picker API

### Node Types

The Data Picker uses a flow-based system with the following node types:

```javascript
// From app.constants.js
export const NODE_TYPES = {
  EntitySection: EntitySection,
  FlowStart: FlowStart,
};

export const EDGE_TYPES = {
  ButtonEdge: ButtonEdge,
};
```

### Flow Structure

A flow consists of nodes and edges with the following structure:

```typescript
interface Node {
  id: string;
  type: 'EntitySection' | 'FlowStart';
  position: {
    x: number;
    y: number;
  };
  data?: {
    entity?: string;
    filters?: Filter[];
    properties?: string[];
  };
}

interface Edge {
  id: string;
  source: string;
  target: string;
  type: 'ButtonEdge';
}
```

### Entity Section Configuration

Each Entity Section node can be configured with:

- Entity selection
- Property filters
- Selected properties
- Connection points for data flow

## UI Builder API

### Component Library

The UI Builder provides a library of components that can be used to build interfaces:

```typescript
interface Component {
  id: string;
  type: string;
  props: {
    [key: string]: any;
  };
  position: {
    x: number;
    y: number;
  };
  dataSource?: {
    flowId: string;
    mapping: {
      [key: string]: string;
    };
  };
}
```

### Component Types

Available component types include:

- Text components
- Input fields
- Buttons
- Containers
- Data displays

## Redux State Structure

### Data Picker State

```typescript
interface DataPickerState {
  nodes: Node[];
  edges: Edge[];
  selectedNode: string | null;
  flowId: string;
}
```

### UI Builder State

```typescript
interface UIBuilderState {
  components: Component[];
  selectedComponent: string | null;
  layout: {
    width: number;
    height: number;
  };
}
```

## Export API

The export process generates a new React project with the following structure:

```typescript
interface ExportConfig {
  components: Component[];
  dataFlows: {
    [flowId: string]: {
      nodes: Node[];
      edges: Edge[];
    };
  };
  theme: ThemeConfig;
  routing: RouteConfig[];
}
```

## Development Guidelines

### Adding New Node Types

1. Create the component in `features/dataPicker/components`
2. Register the node type in `app.constants.js`
3. Update the Redux state to handle the new node type
4. Add necessary validation and error handling

### Creating New Components

1. Define the component interface
2. Implement the component in `features/uiBuilder/components`
3. Add to the component library
4. Update the export process if needed

### State Management

1. Use Redux Toolkit for state management
2. Create new slices for new features
3. Use selectors for accessing state
4. Implement proper error handling

## Best Practices

### Data Picker

- Keep node types simple and focused
- Validate connections between nodes
- Handle edge cases in the flow
- Provide clear error messages

### UI Builder

- Make components reusable
- Support data binding
- Handle responsive layouts
- Validate component configurations

### Export Process

- Validate all configurations
- Include necessary dependencies
- Generate clean, maintainable code
- Provide clear documentation