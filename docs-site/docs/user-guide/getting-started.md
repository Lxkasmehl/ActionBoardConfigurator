---
sidebar_position: 1
---

# Getting Started

Welcome to the WebAppConfigurator! This guide will help you get started with the platform.

## Quick Start

1. Access the WebAppConfigurator through your organization's portal
2. Log in with your credentials
3. Start creating your first visualization or UI

## Basic Concepts

- **Data Picker**: A visual tool for selecting and filtering SAP SuccessFactors data
- **UI Builder**: A drag-and-drop interface for creating custom user interfaces
- **Components**: Pre-built elements that can be used to build your interface
- **Flows**: Visual representations of data relationships and transformations

## Next Steps

- Learn about [Basic Features](../user-guide/basic-features)
- Explore the [Data Picker](../user-guide/data-picker)
- Try the [UI Builder](../user-guide/ui-builder)

## Prerequisites

Before you begin, make sure you have:

- The necessary permissions for API usage
- Familiarity with basic SAP SuccessFactors concepts

## First Steps

### 1. Create Your First Data Query with the Data Picker

1. Navigate to the DataPicker or access it at .../#/data-picker
2. You should see a "Flow beginning" block and an Entity Section
3. Add as many Entity Sections as needed to the view using the plus button in the bottom right corner
4. Build your API request in each Entity Section by combining an Entity, Filter, and selected Properties
5. Connect all Entity Sections that should be part of the final request to the flow beginning
6. To use results from one Entity Section's request as a filter in another Entity Section, connect the "OK" node of the source Entity Section to the "IN" node of the target Entity Section

### 2. Create Your First User Interface and Optionally Use Your Data Picker Flow

1. Navigate to the UIBuilder or open it at .../#/ui-builder
2. On the left side, you'll see a component library with pre-built components that you can use to assemble your user interface
3. Drag and drop components from the component library into the preview area and arrange them as desired
4. All components can be edited by clicking the edit button and filled with custom content
5. You can either enter content directly or specify how and from where content should be fetched from the backend
6. To send specific requests to the backend (including filters), you can select and use a previously created DataPicker flow as a data source

### 3. Export Your Built User Interface

1. When your user interface is complete, click the "Export Website" button in the top right corner
2. You'll receive a zip file containing a completely standalone React project
3. To enable API requests in the new React project, create a .env file with your credentials after extracting the zip folder. The exact format of this file is described in the exported project's README
4. The exported app can then be viewed in dev mode, deployed, or used like any other React app. Note that the components will no longer be editable in this exported version

## Common Issues

### Data Picker Issues

1. **API Request Failures**
   - Verify your API permissions and credentials
   - Check if the selected properties are available for the chosen entity
   - Ensure filters are properly formatted

### UI Builder Issues

1. **Component Rendering**

   - If components don't appear in the preview, try clearing your browser cache
   - Ensure all required properties are filled in the component configuration

2. **Data Binding**
   - If data doesn't load in components, verify the DataPicker flow connection
   - Check that the selected properties match the component's requirements

### Export Issues

1. **Build Failures**

   - Ensure all required dependencies are listed in the project's package.json
   - Check for any console errors before exporting

2. **Environment Setup**
   - If the exported app doesn't connect to the API, verify your .env file configuration
   - Make sure all required environment variables are properly set
