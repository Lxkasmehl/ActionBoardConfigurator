---
sidebar_position: 6
---

# Frequently Asked Questions

This section addresses common questions about using the WebAppConfigurator. If you don't find your question here, please check the other documentation sections or contact support.

## Data Picker Questions

### Q: How do I create a complex filter with multiple conditions?

A: In the filter modal, you can use the "Add Condition" and "Add Condition Group" buttons to create complex filters. Conditions within a group use the same logical operator (AND/OR), and you can nest multiple condition groups to create complex logical expressions.

### Q: Can I use results from one entity section as a filter in another?

A: Yes! Connect the "OK" node of the source entity section to the "IN" node of the target entity section. The values from the first request will then be available as filter options in the second entity section.

### Q: How do I access related data through navigation properties?

A: When selecting a navigation property (like hiringManager), an additional accordion will open allowing you to select properties from the related entity. You can expand navigation properties to multiple levels to access deeply nested data.

## UI Builder Questions

### Q: How do I group components together?

A: Place the components in your layout, then click "Create/Edit Group" followed by "Create Group". Name your group and select all components that should belong to it. The components will be highlighted with matching colored borders when properly grouped.

### Q: Can I use dynamic content in components?

A: Yes! For components like Heading and Paragraph, use double square brackets `[[` to open the DataPicker modal. Select a flow to fetch data from the backend. The content will update automatically when the backend data changes.

### Q: How do I configure a table with multiple properties in one column?

A: Click the three dots in a column header to configure it. You can either use a simple Entity-Property combination or use the DataPicker for more specific requirements. You can combine multiple properties in a single column by selecting them in the configuration.

## Export and Deployment

### Q: What do I get when I export my application?

A: You'll receive a ZIP file containing a complete, standalone React project. This includes all necessary dependencies, your component configurations, and data flow connections. The exported app can be used like any other React application.

### Q: How do I set up the exported application?

A: After extracting the ZIP file, create a .env file with your credentials. The exact format is described in the exported project's README. You can then run the app in development mode or deploy it to any React-compatible hosting.

### Q: Can I edit components after exporting?

A: No, the components are no longer editable in the exported version. The exported app is a standard React application, and any changes would need to be made through code.

## Common Issues

### Q: Why isn't my data loading in components?

A: Check the following:

- Verify your DataPicker flow connection
- Ensure the selected properties match the component's requirements
- Check your API permissions and credentials
- Verify that the data exists in the backend

### Q: Why aren't my filters working?

A: Common causes include:

- Incorrect filter syntax
- Mismatched data types
- Invalid property names
- Missing connections between entity sections

### Q: How do I handle API request failures?

A: First, verify:

- Your API permissions and credentials
- The selected properties are available for the chosen entity
- Filters are properly formatted
- Entity sections are correctly connected

## Performance Questions

### Q: How can I optimize my data queries?

A: Best practices include:

- Select only needed properties
- Use specific filters to limit results
- Avoid unnecessary navigation property expansions
- Test queries with large datasets

### Q: What's the best way to handle large datasets?

A: Consider:

- Implementing pagination
- Using efficient filter combinations
- Loading data only when needed
- Caching frequently used data

## Next Steps

- Review [Basic Features](basic-features)
- Learn about the [Data Picker](data-picker)
- Explore the [UI Builder](ui-builder)
- Check [Best Practices](best-practices)
