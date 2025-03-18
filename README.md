# Entity Explorer

A modern enterprise data visualization and UI builder platform that combines powerful data querying capabilities with an intuitive drag-and-drop interface. Features include interactive flow diagrams for data relationships, advanced filtering, real-time JSON results, and a component-based UI builder.

## 📋 About the Project

The Entity Explorer is an advanced web application designed to visually represent and analyze enterprise data and their relationships. The application consists of two main features:

### Entity Explorer

- **Interactive Flow Diagrams**: Create and connect entity sections to build complex data queries
- **Dynamic Entity Selection**: Choose from a predefined set of enterprise entities (User, Employee, Job, etc.)
- **Property Selection**: Select specific properties to display for each entity
- **Advanced Filtering**: Create complex filters with multiple conditions and logical operators
- **Real-time Results**: View query results in a formatted JSON viewer
- **Drag & Drop Interface**: Intuitive interface for building entity relationships

### UI Builder

- **Component Library**: Pre-built set of UI components (Headings, Paragraphs, Buttons, Cards, Images, Forms)
- **Drag & Drop Interface**: Build user interfaces by dragging and dropping components
- **Live Preview**: Real-time preview of your UI as you build
- **Component Customization**: Customize component properties and styling
- **Responsive Design**: Components adapt to different screen sizes

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
│   ├── entityExplorer/  # Entity Explorer feature
│   └── uiBuilder/       # UI Builder feature
├── redux/          # Redux store, slices, and selectors
├── routes/         # Route definitions
├── shared/         # Shared components and utilities
└── __tests__/      # Unit tests
```

## 🛠️ Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn

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

3. Create a `.env` file in the root directory and add necessary environment variables.

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

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📄 License

This project is licensed under the terms of the [MIT license](LICENSE).
