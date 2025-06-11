---
sidebar_position: 2
---

# Development Setup

This guide explains how to set up your development environment for the WebAppConfigurator.

## Prerequisites

### Required Software

- Node.js (v16 or higher)
- npm or yarn
- Git
- Modern code editor (VS Code recommended)
- Docker (optional)

### Required Accounts

- SAP SuccessFactors access
- GitHub account
- Docker Hub account (optional)

## Installation Steps

### 1. Clone Repository

```bash
git clone [repository-url]
cd WebAppConfigurator
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

1. Create `.env` file:

```env
VITE_API_USER=your_user_id
VITE_API_PASSWORD=your_password
VITE_API_URL=your_api_url
```

### 4. Development Server

```bash
npm run dev
# or
yarn dev
```

## Development Tools

### Recommended Extensions

- ESLint
- Prettier
- TypeScript
- GitLens
- Docker

### Browser Extensions

- React Developer Tools
- Redux DevTools
- Network Monitor

## Project Structure

```
src/
├── components/         # Reusable UI components
├── features/          # Feature-specific components
├── store/             # Redux store and slices
├── services/          # API and service layer
└── utils/             # Helper functions
```

## Configuration

### ESLint

- `.eslintrc.js` for linting rules
- Prettier integration
- TypeScript support

### Testing

- Jest configuration
- Playwright setup
- Test utilities

## Development Workflow

### 1. Code Style

- Follow ESLint rules
- Use Prettier formatting
- Follow TypeScript guidelines
- Write meaningful comments

### 2. Version Control

- Use feature branches
- Write clear commit messages
- Create pull requests
- Review code changes

### 3. Testing

- Write unit tests
- Run integration tests
- Perform E2E testing
- Check coverage

## Common Issues

### Installation Problems

- Node version mismatch
- Dependency conflicts
- Environment variables
- Network issues

### Development Issues

- TypeScript errors
- Linting problems
- Test failures
- Build errors

## Next Steps

- Read the [Architecture](architecture) guide
- Check [API Documentation](api-documentation)
- Learn about [Contributing](contributing)
- Review [Deployment](deployment) process
