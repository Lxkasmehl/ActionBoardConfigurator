# WebAppConfigurator

A modern enterprise data visualization and UI builder platform developed for Pentos AG. This application serves as a powerful interface for SAP SuccessFactors data, enabling users to create custom data queries and build tailored user interfaces for their specific business needs. The platform combines powerful data querying capabilities with an intuitive drag-and-drop interface, making it easy to work with complex SAP SuccessFactors data structures.

## 📋 About the Project

The WebAppConfigurator is an advanced web application designed to visually represent and analyze SAP SuccessFactors data and their relationships. It provides a user-friendly way to interact with SuccessFactors APIs and build custom interfaces for data visualization and manipulation. The application consists of two main features:

### Data Picker

- **Interactive Flow Diagrams**: Create and connect entity sections to build complex SAP SuccessFactors data queries
- **Dynamic Entity Selection**: Choose from a comprehensive set of SuccessFactors entities (User, Employee, Job, Position, etc.)
- **Property Selection**: Select specific properties to display for each entity, with full support for SuccessFactors metadata
- **Advanced Filtering**: Create complex filters with multiple conditions and logical operators, matching SuccessFactors OData query capabilities
- **Real-time Results**: View query results in a formatted JSON viewer with direct SuccessFactors API integration
- **Drag & Drop Interface**: Intuitive interface for building entity relationships and data flows

### UI Builder

- **Component Library**: Pre-built set of UI components optimized for SuccessFactors data display
- **Drag & Drop Interface**: Build user interfaces by dragging and dropping components
- **Live Preview**: Real-time preview of your UI as you build
- **Component Customization**: Customize component properties and styling to match your SuccessFactors instance
- **Responsive Design**: Components adapt to different screen sizes
- **SuccessFactors Integration**: Direct integration with SuccessFactors APIs for real-time data display

## 🚀 Features

- ⚡️ **Lightning Fast Development** with [Vite](https://vitejs.dev/)
- 🎨 **Beautiful UI Components** with [Material-UI Joy](https://mui.com/joy-ui/)
- 🎯 **State Management** with [Redux Toolkit](https://redux-toolkit.js.org/)
- 📊 **Flow Diagrams** using [@xyflow/react](https://reactflow.dev/)
- 🎨 **Styling** with [Tailwind CSS](https://tailwindcss.com/)
- 🧪 **Testing** with [Jest](https://jestjs.io/) and [Playwright](https://playwright.dev/)
- 🎯 **Code Quality** tools:
  - ESLint for code linting
  - Prettier for code formatting

## 📁 Project Structure

```
src/
├── assets/         # Static assets (images, fonts, etc.)
├── features/       # Feature-specific components and logic
│   ├── dataPicker/  # Entity Explorer feature
│   └── uiBuilder/   # UI Builder feature
├── redux/          # Redux store, slices, and selectors
├── routes/         # Route definitions
├── shared/         # Shared components and utilities
├── theme/          # Theme configuration and styling
└── __tests__/      # Unit tests

e2e/
├── features/       # End-to-end test scenarios
└── shared/         # Shared E2E test utilities and configurations
```

## 🛠️ Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn
- Access to SAP SuccessFactors instance
- Valid SuccessFactors API credentials

### Installation

1. Clone the repository:

```bash
git clone [your-repo-url]
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add necessary environment variables:

```env
VITE_API_USER=your_user_id
VITE_API_PASSWORD=your_password
```

### Development

Start the development server:

```bash
npm run dev
# or
yarn dev
```

### Building for Production

Build the project:

```bash
npm run build
# or
yarn build
```

Preview the production build:

```bash
npm run preview
# or
yarn preview
```

## 🧪 Testing

The project includes both unit tests and end-to-end tests:

### Unit Tests

Run Jest unit tests:

```bash
npm run test:unit
# or
yarn test:unit
```

### End-to-End Tests

Run Playwright E2E tests:

```bash
npm run test:e2e
# or
yarn test:e2e
```

### Run All Tests

Run both unit and E2E tests:

```bash
npm run test
# or
yarn test
```

## 🎨 Code Formatting

Format your code:

```bash
npm run format
# or
yarn format
```

## 📝 Scripts

- `dev`: Start development server
- `build`: Build for production
- `preview`: Preview production build
- `lint`: Run ESLint
- `format`: Format code with Prettier
- `test`: Run all tests (unit + E2E)
- `test:unit`: Run Jest unit tests
- `test:e2e`: Run Playwright E2E tests

## 📦 Tech Stack

- React 19
- Vite 5
- Redux Toolkit
- Material-UI Joy
- Tailwind CSS
- Jest
- Playwright
- @xyflow/react
- @dnd-kit (Drag and Drop)
- Day.js
- Framer Motion
- React Router DOM
- SAP SuccessFactors OData API
- SuccessFactors Metadata API

## 📄 Ownership and License

This project is developed by Lukas Mehl as an employee of Pentos AG. All rights, including but not limited to copyright, patent rights, and trade secrets, are owned by Pentos AG. This software is proprietary and confidential. Unauthorized copying, distribution, or use of this software, via any medium, is strictly prohibited.

## 🤝 Contributing

This is a proprietary project owned by Pentos AG. External contributions are not accepted at this time.
