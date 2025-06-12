---
sidebar_position: 2
---

# Development Setup

This guide will help you set up your development environment for the WebAppConfigurator project.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16 or higher)
- npm (comes with Node.js)
- A modern code editor (VS Code recommended)
- Git

## Getting Started

1. **Clone the Repository**

   ```bash
   git clone [repository-url]
   cd WebAppConfigurator
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Start Development Server**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## Project Structure

```
WebAppConfigurator/
├── src/
│   ├── features/          # Main application features
│   │   ├── dataPicker/   # Data Picker implementation
│   │   └── uiBuilder/    # UI Builder implementation
│   ├── redux/            # Redux store and slices
│   ├── routes/           # Application routing
│   ├── shared/           # Shared components
│   ├── theme/            # Theme configuration
│   └── assets/          # Static assets
├── docs-site/           # Documentation website
└── package.json         # Project dependencies
```

## Key Dependencies

- **React**: Frontend framework
- **Vite**: Build tool and development server
- **@mui/joy**: UI component library
- **@xyflow/react**: Flow diagram library
- **Redux Toolkit**: State management
- **Tailwind CSS**: Utility-first CSS framework

## Development Workflow

1. **Feature Development**

   - Create new features in the `src/features` directory
   - Follow the existing component structure
   - Use Redux for state management
   - Implement proper error handling

2. **Testing**

   ```bash
   # Run unit tests
   npm test

   # Run tests in watch mode
   npm test -- --watch
   ```

3. **Building for Production**

   ```bash
   npm run build
   ```

## Common Development Tasks

### Adding a New Component

1. Create the component file in the appropriate feature directory
2. Import and use Material-UI Joy components
3. Style with Tailwind CSS
4. Add to the component library if it's a reusable component

### Modifying the Data Picker

1. Work with the flow diagram components in `features/dataPicker`
2. Update node types in `app.constants.js`
3. Modify the Redux state as needed
4. Test the flow diagram functionality

### Updating the UI Builder

1. Modify components in `features/uiBuilder`
2. Update the component library
3. Test the drag-and-drop functionality
4. Verify the export process

## Troubleshooting

### Common Issues

1. **Development Server Issues**

   - Clear the `node_modules` folder and run `npm install` again
   - Check for port conflicts
   - Verify Node.js version

2. **Build Issues**

   - Check for missing dependencies
   - Verify import paths
   - Check for syntax errors

3. **Flow Diagram Issues**
   - Verify node types are properly registered
   - Check edge connections
   - Validate node positions
