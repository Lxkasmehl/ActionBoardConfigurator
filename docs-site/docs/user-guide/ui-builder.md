---
sidebar_position: 4
---

# UI Builder

## Overview

The UI Builder is a powerful drag-and-drop interface that allows you to create web applications by combining pre-built components. It provides a visual way to design and configure your application's user interface, with real-time preview capabilities and seamless integration with backend data.

## Getting Started

To start using the UI Builder, it's important to understand its structure. The interface consists of two main areas:

- **Component Library (Left Side)**: Contains pre-built components that you can use to build your web application
- **Preview Area (Right Side)**: Shows a live preview of your web application as you build it

To use a component, simply drag it from the library into the preview area. Components can be arranged freely within the preview area. To remove a component, drag it to the trash icon at the bottom of the screen.

The "Create/Edit Group" button in the lower left corner is essential for properly using FilterArea, ButtonBar, Table, and Chart components together (more details in their respective sections).

The "Export Website" button in the upper right corner is used for the final step - exporting your completed web application. Clicking this button will download a ZIP file containing a complete, standalone React project with your finished web application.

## Components in Detail

### Heading Component

The Heading Component is a text component designed for titles and section headers. After dragging it into the preview area, you can edit its content in two ways:

1. **Static Text**: Simply enter the text you want to display as a heading
2. **Dynamic Content**: Use double square brackets `[[` to open the DataPicker modal, where you can select a flow to fetch data from the backend

If the selected DataPicker flow returns a single string, it will be displayed directly. For multiple strings, a modal will open allowing you to select the specific string to display. The content updates automatically when the backend data changes, making it fully dynamic.

### Paragraph Component

The Paragraph Component functions exactly like the Heading Component but is designed for body text. The main difference is in the formatting - paragraphs are styled to display longer text in a less prominent way. The editing process remains the same as the Heading Component.

### Button Component

The Button Component is currently under development. It will provide interactive elements for user actions within your application.

### Image Component

The Image Component is the simplest component, designed solely for displaying images. When inserted, it initially shows a placeholder image. Clicking the edit button opens a modal where you can either:

- Upload an image to display
- Insert a link to an external image

### FilterArea, ButtonBar, and Table

These three components are designed to work together, with the Table being the core component. While the Table can function independently, FilterArea and ButtonBar require proper grouping to work effectively.

#### Setting Up the Group

1. Place the components anywhere in your web application
2. Click "Create/Edit Group" followed by "Create Group"
3. Name the group for future reference
4. Select all components that should belong to the group
5. Once created, the components will be highlighted with matching colored borders

#### Configuring the Components

1. **Table Configuration**:

   - Click the three dots in a column header to configure it
   - Choose between:
     - Simple Entity-Property combination
     - DataPicker as the data source for more specific requirements
   - Set the Main Entity for the table
   - Combine multiple properties in a single column if needed
   - Set column labels

2. **FilterArea Configuration**:

   - Add or remove filters as needed
   - Click the edit button on a filter to select which table column it should filter
   - Available values from the selected column will appear as filter options

3. **ButtonBar Configuration**:
   - Click the edit button to open the configuration modal
   - Select which buttons to display
   - Arrange the buttons in your preferred order

### Chart Component

While the Chart Component could be grouped with FilterArea, ButtonBar, and Table, it's discussed separately for clarity. It only functions when grouped with a Table component. Through the edit button, you can:

- Select which table column to display graphically
- Choose between Bar and Pie chart visualizations

Example use case: If you have a table displaying User entity properties including gender, you can create a chart showing the gender distribution by using that column as the data source.

## Best Practices

1. **Component Organization**:

   - Group related components together
   - Use appropriate spacing and layout
   - Maintain consistent styling across components

2. **Data Integration**:

   - Use the DataPicker for dynamic content
   - Ensure proper entity relationships
   - Test data flow before finalizing

3. **User Experience**:
   - Keep the interface clean and intuitive
   - Use appropriate component types for different data
   - Implement filters and buttons logically

## Next Steps

- Learn about the [Data Picker](data-picker)
- Check [Best Practices](best-practices)
- Read the [FAQ](faq)
- Explore [Basic Features](basic-features)
