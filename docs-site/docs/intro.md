---
sidebar_position: 1
---

# WebAppConfigurator Documentation

Welcome to the WebAppConfigurator documentation. This platform is a modern enterprise data visualization and UI builder, specifically designed to work with SAP SuccessFactors data.

## Documentation Structure

This documentation is divided into two main sections:

### User Guide

- [Getting Started](/docs/user-guide/getting-started) - Quick start and basic concepts
- [Basic Features](/docs/user-guide/basic-features) - Overview of main features
- [Data Picker](/docs/user-guide/data-picker) - Detailed guide for data selection
- [UI Builder](/docs/user-guide/ui-builder) - Step-by-step guide for creating user interfaces
- [FAQ](/docs/user-guide/faq) - Frequently asked questions
- [Best Practices](/docs/user-guide/best-practices) - Recommendations for optimal usage

### Developer Guide

- [Architecture](/docs/developer-guide/architecture) - Technical overview and system design
- [Setup](/docs/developer-guide/setup) - Development environment setup
- [API Documentation](/docs/developer-guide/api-documentation) - Technical API reference
- [Contributing](/docs/developer-guide/contributing) - Contribution guidelines
- [Deployment](/docs/developer-guide/deployment) - Deployment process
- [Troubleshooting](/docs/developer-guide/troubleshooting) - Solutions for common issues

## About WebAppConfigurator

The WebAppConfigurator provides two main features:

### Data Picker

- Interactive flow diagrams for complex SAP SuccessFactors data queries
- Dynamic entity selection from SuccessFactors
- Advanced property selection and filtering
- Real-time results with JSON viewer
- Intuitive drag & drop interface

### UI Builder

- Pre-built UI components optimized for SuccessFactors
- Drag & drop interface for building user interfaces
- Live preview functionality
- Component customization
- Responsive design
- Direct SuccessFactors API integration

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Access to SAP SuccessFactors instance
- Valid SuccessFactors API credentials

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env` file with your credentials:

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

## Tech Stack

- React 19
- Vite 5
- Redux Toolkit
- Material-UI Joy
- Tailwind CSS
- Jest & Playwright for testing
- @xyflow/react for flow diagrams
- SAP SuccessFactors OData API
