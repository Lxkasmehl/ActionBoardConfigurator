export const generateComponentCode = (
  component,
  columnData,
  tableColumns,
  componentGroups,
  tableData,
) => {
  const { type, props } = component;

  switch (type) {
    case 'heading':
      return `<Typography level="${props.level || 'h2'}" sx={{ marginBottom: '2rem' }}>${props.text}</Typography>`;
    case 'paragraph':
      return `<Typography sx={{ marginBottom: '2rem' }}>${props.text}</Typography>`;
    case 'button':
      return `<Button variant="${props.variant}" color="${props.color}">${props.text}</Button>`;
    case 'image':
      return `<img src="${props.src}" alt="${props.alt}" style={{ maxWidth: '100%', height: 'auto' }} />`;
    case 'filterArea':
      return `<FilterArea componentId="${component.id}" 
      fields={${JSON.stringify(props.fields)}} 
      columnData={${JSON.stringify(columnData)}} 
      tableColumns={${JSON.stringify(tableColumns)}} 
      componentGroups={${JSON.stringify(componentGroups)}} />`;
    case 'buttonBar':
      return `<ButtonBar fields={${JSON.stringify(props.fields)}} 
      componentId="${component.id}" 
      componentGroups={${JSON.stringify(componentGroups)}} 
      tableColumns={${JSON.stringify(tableColumns)}}
      tableData={${JSON.stringify(tableData)}} />`;
    case 'table':
      return `<TableComponent componentId="${component.id}" 
      columnData={${JSON.stringify(columnData)}} 
      tableColumns={${JSON.stringify(tableColumns)}} />`;
    case 'chart':
      return `<ChartComponent component={${JSON.stringify(component)}} />`;
    default:
      return '';
  }
};
