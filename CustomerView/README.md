# Customer View - Action Board Configurator

This is the customer-facing application that dynamically renders components based on configuration stored in Firebase.

## Features

- **Dynamic Component Rendering**: Renders components based on configuration from Firebase
- **Table Components**: Displays data tables with filtering, sorting, and pagination
- **Chart Components**: Renders various chart types (bar, line, pie, scatter)
- **Text Components**: Displays headings and paragraphs
- **Button Components**: Interactive buttons and button bars
- **Filter Components**: Advanced filtering capabilities

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file with your API credentials:

   ```
   VITE_API_USER=your_api_username
   VITE_API_PASSWORD=your_api_password
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## How it works

1. The application loads configuration from Firebase (`apps/01` collection)
2. Based on the configuration, it renders the appropriate components
3. Components can interact with APIs, display data, and provide user interactions
4. The configuration includes:
   - Component definitions with types and properties
   - Table column configurations
   - Chart data and settings
   - Filter definitions
   - Button configurations

## Component Types

- **Text Components**: Headings and paragraphs with customizable styling
- **Table Components**: Data grids with API integration, filtering, and sorting
- **Chart Components**: Various chart types using MUI X Charts
- **Button Components**: Interactive buttons with click handlers
- **Filter Components**: Advanced filtering with multiple input types
- **Button Bar Components**: Groups of buttons with different layouts

## Configuration

The application expects a specific configuration structure in Firebase:

```javascript
{
  components: [
    {
      id: "unique-id",
      type: "table|chart|text|button|filterArea|buttonBar",
      props: {
        // Component-specific properties
      }
    }
  ],
  columnData: {},
  tableColumns: {},
  componentGroups: [],
  tableData: {},
  visibleColumns: {},
  tableConfigEntries: {}
}
```
