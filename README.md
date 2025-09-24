# WebAppConfigurator

A modern enterprise data visualization and UI builder platform developed for Pentos AG. This application serves as a powerful interface for SAP SuccessFactors data, enabling users to create custom data queries and build tailored user interfaces for their specific business needs. The platform combines powerful data querying capabilities with an intuitive drag-and-drop interface, making it easy to work with complex SAP SuccessFactors data structures.

## 📋 About the Project

The WebAppConfigurator is a comprehensive multi-application platform designed to visually represent and analyze SAP SuccessFactors data and their relationships. It provides a user-friendly way to interact with SuccessFactors APIs and build custom interfaces for data visualization and manipulation. The platform consists of three main applications:

### AdminView - Configuration & Development Platform

The AdminView is the main configuration platform where administrators and developers can create and manage data queries and UI configurations.

#### Data Picker Feature

- **Interactive Flow Diagrams**: Create and connect entity sections to build complex SAP SuccessFactors data queries using React Flow
- **Dynamic Entity Selection**: Choose from a comprehensive set of SuccessFactors entities (User, Employee, Job, Position, etc.)
- **Property Selection**: Select specific properties to display for each entity, with full support for SuccessFactors metadata
- **Advanced Filtering**: Create complex filters with multiple conditions and logical operators, matching SuccessFactors OData query capabilities
- **Real-time Results**: View query results in a formatted JSON viewer with direct SuccessFactors API integration
- **Drag & Drop Interface**: Intuitive interface for building entity relationships and data flows

#### UI Builder Feature

- **Component Library**: Pre-built set of UI components optimized for SuccessFactors data display
- **Drag & Drop Interface**: Build user interfaces by dragging and dropping components using @dnd-kit
- **Live Preview**: Real-time preview of your UI as you build
- **Component Customization**: Customize component properties and styling to match your SuccessFactors instance
- **Advanced Table Components**: Full-featured data tables with sorting, filtering, column selection, and export capabilities
- **Chart Components**: Interactive charts and visualizations using MUI X Charts
- **Text Components**: Flexible text and heading components with dynamic content
- **Button Bar Components**: Customizable button bars with dropdown menus and actions
- **Filter Area Components**: Advanced filtering interfaces for data manipulation
- **Export Functionality**: Export configurations as standalone React applications
- **Component Grouping**: Organize components into logical groups for better management

### CustomerView - Runtime Application

The CustomerView is a lightweight runtime application that displays configurations created in the AdminView.

#### Features

- **Dynamic Component Rendering**: Renders components based on configuration from AdminView
- **Real-time Data Display**: Displays live SuccessFactors data using configured queries
- **Interactive Components**: Fully functional tables, charts, filters, and buttons
- **Configuration Management**: Handles multiple configurations and URL-based config selection
- **Error Handling**: Comprehensive error handling and user feedback
- **Responsive Design**: Adapts to different screen sizes and devices

### Documentation Site

A comprehensive documentation site built with Docusaurus that provides:

- **User Guides**: Step-by-step instructions for using the platform
- **Developer Documentation**: Technical documentation for developers
- **API Documentation**: Complete API reference
- **Best Practices**: Guidelines for optimal usage
- **Troubleshooting**: Common issues and solutions

## 🚀 Features

### Core Platform Features

- ⚡️ **Lightning Fast Development** with [Vite](https://vitejs.dev/)
- 🎨 **Beautiful UI Components** with [Material-UI Joy](https://mui.com/joy-ui/)
- 🎯 **State Management** with [Redux Toolkit](https://redux-toolkit.js.org/)
- 📊 **Flow Diagrams** using [@xyflow/react](https://reactflow.dev/)
- 🎨 **Styling** with [Tailwind CSS](https://tailwindcss.com/)
- 🧪 **Testing** with [Playwright](https://playwright.dev/)
- 🔧 **Advanced Build Configuration** with custom Vite plugins and SSL support
- 🌐 **Multi-Application Architecture** - Separate AdminView and CustomerView applications
- 📚 **Comprehensive Documentation** with Docusaurus

### AdminView Specific Features

- 🎯 **Advanced Drag & Drop** with [@dnd-kit](https://dndkit.com/)
- 📊 **Interactive Data Tables** with [MUI X Data Grid](https://mui.com/x/react-data-grid/)
- 📈 **Chart Components** with [MUI X Charts](https://mui.com/x/react-charts/)
- 🔍 **Advanced Filtering** with complex condition builders
- 📤 **Excel Export** functionality with [XLSX](https://sheetjs.com/)
- 🎨 **Component Grouping** and organization features
- 🔧 **Custom Vite Plugins** for Popper.js compatibility
- 🛡️ **SSL Support** with self-signed certificates for development

### CustomerView Specific Features

- ⚡ **Lightweight Runtime** optimized for performance
- 🔄 **Dynamic Component Rendering** based on configuration
- 🌐 **URL-based Configuration** selection
- 🎯 **Real-time Data Display** with SuccessFactors integration
- 📱 **Responsive Design** for all device types

### Development & Testing Features

- 🧪 **Comprehensive Testing Suite** with Playwright
- 🎯 **Code Quality** tools:
  - ESLint for code linting
  - Prettier for code formatting
- 🔧 **Advanced Build Configuration** with custom plugins
- 📊 **E2E Testing** with Playwright across multiple browsers
- 🚀 **Hot Module Replacement** for fast development

## 📁 Project Structure

The WebAppConfigurator is organized as a multi-application monorepo with the following structure:

```
ActionBoardConfigurator/
├── AdminView/                    # Main configuration platform
│   ├── src/
│   │   ├── features/
│   │   │   ├── dataPicker/       # Data Picker feature components
│   │   │   │   ├── components/   # UI components for data picking
│   │   │   │   ├── hooks/        # Custom hooks for data picker
│   │   │   │   └── utils/        # Utility functions and API handlers
│   │   │   └── uiBuilder/        # UI Builder feature components
│   │   │       ├── components/   # UI components for building interfaces
│   │   │       │   ├── buttonBar/ # Button bar components
│   │   │       │   ├── chart/    # Chart components
│   │   │       │   ├── common/    # Common UI components
│   │   │       │   ├── dragAndDrop/ # Drag and drop components
│   │   │       │   ├── layout/   # Layout components
│   │   │       │   ├── table/    # Table components
│   │   │       │   └── text/     # Text components
│   │   │       ├── hooks/        # Custom hooks for UI builder
│   │   │       └── utils/        # Utility functions and export tools
│   │   ├── redux/                # Redux store and slices
│   │   ├── routes/               # Route definitions
│   │   ├── shared/               # Shared components and utilities
│   │   └── firebase.js           # Firebase configuration
│   ├── e2e/                      # End-to-end tests
│   ├── dist/                     # Built application
│   └── package.json              # AdminView dependencies
├── CustomerView/                 # Runtime application
│   ├── src/
│   │   ├── components/           # Runtime components
│   │   ├── hooks/               # Custom hooks
│   │   ├── redux/               # Redux store for runtime
│   │   └── utils/               # Utility functions
│   ├── e2e/                     # CustomerView E2E tests
│   │   ├── helpers/             # Test helper functions
│   │   └── tests/               # Test files
│   ├── playwright.config.js     # Playwright configuration
│   └── package.json             # CustomerView dependencies
├── e2e-integration/             # Integration testing
│   ├── tests/                   # Integration test files
│   ├── playwright.config.js     # Integration test configuration
│   └── package.json             # Integration test dependencies
├── docs-site/                   # Documentation site
│   ├── docs/                    # Documentation content
│   │   ├── user-guide/         # User documentation
│   │   └── developer-guide/    # Developer documentation
│   ├── src/                     # Documentation site source
│   └── package.json             # Documentation dependencies
└── public/                      # Shared public assets
```

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Access to SAP SuccessFactors instance
- Valid SuccessFactors API credentials
- Git (for cloning the repository)

### Installation

1. Clone the repository:

```bash
git clone [your-repo-url]
cd ActionBoardConfigurator
```

2. Install dependencies for each application:

```bash
# Install AdminView dependencies
cd AdminView
npm install

# Install CustomerView dependencies
cd ../CustomerView
npm install

# Install Documentation site dependencies
cd ../docs-site
npm install

# Install Integration testing dependencies
cd ../e2e-integration
npm install
```

3. Create environment files for each application:

**AdminView/.env:**

```env
VITE_API_USER=your_user_id
VITE_API_PASSWORD=your_password
```

**CustomerView/.env:**

```env
VITE_API_USER=your_user_id
VITE_API_PASSWORD=your_password
```

### Development

#### AdminView (Main Configuration Platform)

Start the AdminView development server:

```bash
cd AdminView
npm run dev
```

For SSL development (recommended for SuccessFactors integration):

```bash
cd AdminView
npm run dev:ssl
```

#### CustomerView (Runtime Application)

Start the CustomerView development server:

```bash
cd CustomerView
npm run dev
```

#### Documentation Site

Start the documentation site:

```bash
cd docs-site
npm run start
```

### Building for Production

#### AdminView

```bash
cd AdminView
npm run build
```

#### CustomerView

```bash
cd CustomerView
npm run build
```

#### Documentation Site

```bash
cd docs-site
npm run build
```

### Preview Production Builds

#### AdminView

```bash
cd AdminView
npm run preview
```

#### CustomerView

```bash
cd CustomerView
npm run preview
```

## 🧪 Testing

The project includes comprehensive testing across all applications with multiple testing strategies:

### AdminView Testing

#### Unit Tests

Run Jest unit tests for AdminView:

```bash
cd AdminView
npm run test:unit
```

#### End-to-End Tests

Run Playwright E2E tests for AdminView:

```bash
cd AdminView
npm run test:e2e
```

#### Run All AdminView Tests

```bash
cd AdminView
npm run test
```

### CustomerView Testing

#### End-to-End Tests

Run Playwright E2E tests for CustomerView:

```bash
cd CustomerView
npm run test:e2e
```

#### Run All CustomerView Tests

```bash
cd CustomerView
npm run test
```

### Integration Testing

#### Cross-Application Integration Tests

Run integration tests that test both AdminView and CustomerView together:

```bash
cd e2e-integration
npm run test
```

#### Integration Test Options

```bash
# Run tests with visible browser
npm run test:headed

# Run tests in debug mode
npm run test:debug

# Show test report
npm run test:report
```

### Documentation Site Testing

The documentation site uses Docusaurus's built-in testing and validation.

### Test Configuration

- **Jest**: Configured for React component testing with Babel transformation
- **Playwright**: Configured for cross-browser testing (Chrome, Firefox, Safari)
- **SSL Support**: AdminView E2E tests run with SSL certificates for SuccessFactors integration
- **HTTP Support**: CustomerView E2E tests run with standard HTTP
- **Integration Testing**: Tests both applications simultaneously with different ports
- **Test Reports**: HTML reports generated for test results and debugging

## 🎨 Code Formatting

Format your code for AdminView:

```bash
cd AdminView
npm run format
```

## 📝 Available Scripts

### AdminView Scripts

- `dev`: Start development server
- `dev:ssl`: Start development server with SSL certificates
- `build`: Build for production
- `preview`: Preview production build
- `lint`: Run ESLint
- `format`: Format code with Prettier
- `test`: Run all tests (unit + E2E)
- `test:unit`: Run Jest unit tests
- `test:e2e`: Run Playwright E2E tests
- `generate-ssl`: Generate SSL certificates for development

### CustomerView Scripts

- `dev`: Start development server
- `build`: Build for production
- `preview`: Preview production build
- `lint`: Run ESLint
- `test:e2e`: Run Playwright E2E tests
- `test`: Run all tests (E2E)

### Integration Testing Scripts

- `test`: Run integration tests
- `test:headed`: Run tests with visible browser
- `test:debug`: Run tests in debug mode
- `test:report`: Show test report

### Documentation Site Scripts

- `start`: Start development server
- `build`: Build documentation site
- `serve`: Serve built documentation
- `deploy`: Deploy to GitHub Pages
- `clear`: Clear Docusaurus cache

## 📦 Tech Stack

### Core Technologies

- **React 19** - Latest React with concurrent features
- **Vite 5** - Fast build tool and development server
- **Redux Toolkit** - State management
- **Material-UI Joy** - Modern UI component library
- **Tailwind CSS** - Utility-first CSS framework

### AdminView Specific

- **@xyflow/react** - Flow diagrams and node-based interfaces
- **@dnd-kit** - Advanced drag and drop functionality
- **MUI X Data Grid** - Professional data tables
- **MUI X Charts** - Interactive charts and visualizations
- **MUI X Date Pickers** - Date selection components
- **@tanstack/react-virtual** - Virtual scrolling for large datasets
- **Framer Motion** - Animation library
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API requests
- **Day.js** - Date manipulation library
- **XLSX** - Excel file generation
- **JSZip** - ZIP file creation for exports
- **File-saver** - File download functionality

### CustomerView Specific

- **React 19** - Runtime React application
- **Material-UI Joy** - UI components
- **Recharts** - Chart library for runtime
- **Firebase** - Configuration storage and retrieval

### Development & Testing

- **Jest** - Unit testing framework
- **Playwright** - End-to-end testing
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Babel** - JavaScript transpilation
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

### Documentation

- **Docusaurus 3** - Documentation site generator
- **MDX** - Markdown with JSX support
- **Prism** - Syntax highlighting

### External Integrations

- **SAP SuccessFactors OData API** - Data source
- **SuccessFactors Metadata API** - Entity and property information
- **Firebase** - Configuration storage and real-time updates

## 🚀 Advanced Features

### SSL Development Support

- **Self-signed Certificates**: Automatic SSL certificate generation for development
- **HTTPS Development Server**: Secure development environment for SuccessFactors integration
- **Certificate Management**: Easy certificate generation and renewal

### Advanced Build Configuration

- **Custom Vite Plugins**: Specialized plugins for Popper.js compatibility
- **Environment-specific Builds**: Different configurations for development and production
- **Asset Optimization**: Optimized build output with proper asset handling
- **Source Maps**: Full source map support for debugging

### Multi-Application Architecture

- **Separation of Concerns**: Clear separation between configuration (AdminView) and runtime (CustomerView)
- **Independent Deployment**: Each application can be deployed independently
- **Shared Resources**: Common assets and configurations shared across applications
- **Scalable Architecture**: Easy to extend with additional applications

## 📄 Ownership and License

This project is developed by Lukas Mehl as an employee of Pentos AG. All rights, including but not limited to copyright, patent rights, and trade secrets, are owned by Pentos AG. This software is proprietary and confidential. Unauthorized copying, distribution, or use of this software, via any medium, is strictly prohibited.

## 🤝 Contributing

This is a proprietary project owned by Pentos AG. External contributions are not accepted at this time.

## 📞 Support

For support and questions regarding this platform, please contact the development team at Pentos AG.
