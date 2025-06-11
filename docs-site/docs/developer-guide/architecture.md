---
sidebar_position: 1
---

# Technical Architecture

This documentation describes the technical architecture of the WebAppConfigurator, a tool for building data-driven web applications with a visual interface.

## System Overview

The WebAppConfigurator is a modern Single-Page Application (SPA) built with:

- **Frontend**: React with Vite
- **State Management**: Redux Toolkit
- **UI Framework**: Material-UI Joy
- **Styling**: Tailwind CSS
- **Flow Diagrams**: @xyflow/react
- **Testing**: Jest & Playwright

## Main Components

### 1. Frontend Architecture

```
src/
├── features/          # Feature-specific components
│   ├── dataPicker/   # Data Picker functionality
│   └── uiBuilder/    # UI Builder functionality
├── redux/            # Redux store and slices
├── routes/           # Application routing
├── shared/           # Shared components and utilities
├── theme/            # Theme configuration
└── assets/          # Static assets
```

### 2. Data Picker

The Data Picker is a flow-based interface that allows users to:

- Create complex data queries through a visual flow diagram
- Connect multiple entity sections to build nested queries
- Configure filters and property selections for each entity
- Preview and test queries in real-time

#### Key Components:

- `FlowStart`: The entry point of the flow diagram
- `EntitySection`: Configurable section for entity selection and filtering
- `ButtonEdge`: Custom edge type for connecting nodes in the flow

### 3. UI Builder

The UI Builder provides a visual interface for:

- Building user interfaces through drag-and-drop
- Configuring components with data from Data Picker flows
- Previewing the interface in real-time
- Exporting the final application as a standalone React project

## Data Flow

1. **Data Picker Flow**

   - User creates a flow diagram with Entity Sections
   - Each section configures an entity, its filters, and properties
   - Sections can be connected to create nested queries
   - The flow is stored in Redux state

2. **UI Builder Flow**

   - User drags components from the library
   - Components can be configured with static content or data from Data Picker flows
   - Changes are reflected in real-time in the preview
   - The final configuration is stored in Redux state

3. **Export Process**
   - The configured UI and data flows are processed
   - A new React project is generated
   - All necessary components and configurations are included
   - The project is packaged as a downloadable zip file

## State Management

The application uses Redux Toolkit for state management with the following main slices:

- Data Picker state (flows, nodes, edges)
- UI Builder state (components, layout, configurations)
- Application state (navigation, settings)

## Development Environment

### Prerequisites

- Node.js v16+
- npm or yarn
- IDE with React support

### Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Run tests: `npm test`

## Best Practices

### Code Style

- Follow the existing component structure
- Use functional components with hooks
- Implement proper error handling
- Add comments for complex logic

### Testing

- Write unit tests for components
- Test flow diagram functionality
- Verify UI Builder interactions
- Test the export process

### Documentation

- Keep component documentation up to date
- Document any changes to the flow system
- Update API integration details
- Maintain clear commit messages

## Next Steps

- [Setup](setup) - Set up development environment
- [API Documentation](api-documentation) - Technical API reference
- [Contributing](contributing) - Contribution guidelines
- [Deployment](deployment) - Deployment process
- [Troubleshooting](troubleshooting) - Solutions for common issues
