export const generateComponentCode = (
  component,
  columnData,
  tableColumns,
  componentGroups,
  tableData,
  tableConfigEntries,
) => {
  const { type, props } = component;

  switch (type) {
    case 'heading':
    case 'paragraph':
      return `<TextComponent component={${JSON.stringify(component)}} />`;
    case 'button':
      return `<Button variant="${props.variant}" color="${props.color}">${props.text}</Button>`;
    case 'image':
      return `<div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
        <img src="${props.src}" style={{ maxHeight: '500px', width: 'auto', maxWidth: '100%' }} />
      </div>`;
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
      tableColumns={${JSON.stringify(tableColumns)}} 
      tableConfigEntries={${JSON.stringify(tableConfigEntries)}} />`;
    case 'chart':
      return `<ChartComponent component={${JSON.stringify(component)}} />`;
    default:
      return '';
  }
};
