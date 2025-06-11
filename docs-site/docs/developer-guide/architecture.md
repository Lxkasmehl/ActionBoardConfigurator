---
sidebar_position: 1
---

# Technical Architecture

This documentation describes the technical architecture of the WebAppConfigurator and its main components.

## System Overview

The WebAppConfigurator is a modern Single-Page Application (SPA) based on the following technologies:

- **Frontend**: React 19 with Vite 5
- **State Management**: Redux Toolkit
- **UI Framework**: Material-UI Joy
- **Styling**: Tailwind CSS
- **Flow Diagrams**: @xyflow/react
- **Testing**: Jest & Playwright
- **API**: SAP SuccessFactors OData API

## Main Components

### 1. Frontend Architecture

```
src/
├── components/         # Reusable UI components
├── features/          # Feature-specific components
│   ├── data-picker/   # Data Picker functionality
│   └── ui-builder/    # UI Builder functionality
├── store/             # Redux store and slices
├── services/          # API and service layer
└── utils/             # Helper functions
```

### 2. Data Picker

The Data Picker is a complex component that:

- Manages flow diagrams for data queries
- Communicates with the SuccessFactors API
- Processes and displays data in real-time

#### Main Features:

- Entity Selection
- Property Filtering
- Query Building
- Real-time Preview

### 3. UI Builder

The UI Builder enables:

- Drag & Drop component management
- Live Preview
- Responsive Design
- Component Configuration

#### Available Components:

- Charts
- Tables
- Forms
- Custom Components

## Data Flow

1. **User Interaction**

   - User interacts with Data Picker or UI Builder
   - Actions are forwarded to Redux store

2. **State Management**

   - Redux processes actions
   - State is updated
   - UI is re-rendered

3. **API Communication**
   - Services communicate with SuccessFactors API
   - Data is stored in the store
   - UI is updated with new data

## Security

- OAuth 2.0 for API authentication
- HTTPS for all communication
- XSS Protection
- CSRF Protection
- Input Validation

## Performance

- Code Splitting
- Lazy Loading
- Memoization
- Caching
- Optimized API calls

## Deployment

The WebAppConfigurator is deployed as Docker containers:

- Frontend container
- Nginx for static assets
- CI/CD pipeline for automated deployment

## Development Environment

### Prerequisites

- Node.js v16+
- npm or yarn
- Docker (optional)
- IDE with TypeScript support

### Local Development

1. Clone repository
2. Install dependencies
3. Start development server
4. Run tests

## Best Practices

### Code Style

- ESLint for code quality
- Prettier for formatting
- TypeScript for type safety

### Testing

- Unit tests with Jest
- E2E tests with Playwright
- Integration tests
- Performance tests

### Documentation

- JSDoc for code documentation
- Storybook for components
- API documentation
- Architecture documentation

## Next Steps

- [Setup](setup) - Set up development environment
- [API Documentation](api-documentation) - Technical API reference
- [Contributing](contributing) - Contribution guidelines
- [Deployment](deployment) - Deployment process
- [Troubleshooting](troubleshooting) - Solutions for common issues
