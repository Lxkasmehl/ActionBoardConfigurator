export const generateComponentCode = (component, columnData) => {
  const { type, props } = component;

  console.log('columnData', columnData);

  switch (type) {
    case 'heading':
      return `<Typography level="${props.level || 'h2'}" sx={{ mb: 2}}>${props.text}</Typography>`;
    case 'paragraph':
      return `<Typography sx={{ mb: 2 }}>${props.text}</Typography>`;
    case 'button':
      return `<Button variant="${props.variant}" color="${props.color}">${props.text}</Button>`;
    case 'image':
      return `<img src="${props.src}" alt="${props.alt}" style={{ maxWidth: '100%', height: 'auto' }} />`;
    case 'filterArea':
      return `<FilterArea fields={${JSON.stringify(props.fields)}} columnData={${JSON.stringify(columnData)}} />`;
    case 'buttonBar':
      return `<ButtonBar fields={${JSON.stringify(props.fields)}} />`;
    case 'table':
      return `<TableComponent data={tableData} />`;
    case 'chart':
      return `<ChartComponent data={${JSON.stringify(props.data)}} />`;
    default:
      return '';
  }
};
