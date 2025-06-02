---
sidebar_position: 1
---

# WebAppConfigurator Documentation

Welcome to the WebAppConfigurator documentation. This platform is a modern enterprise data visualization and UI builder developed for Pentos AG, specifically designed to work with SAP SuccessFactors data.

## Overview

The WebAppConfigurator provides two main features:

### Data Picker

- Interactive flow diagrams for building complex SAP SuccessFactors data queries
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
