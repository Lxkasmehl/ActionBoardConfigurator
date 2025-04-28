export const generateComponentCode = (component) => {
  const { type, props } = component;

  switch (type) {
    case 'heading':
      return `<Typography level="${props.level || 'h2'}">${props.text}</Typography>`;
    case 'paragraph':
      return `<Typography>${props.text}</Typography>`;
    case 'button':
      return `<Button variant="${props.variant}" color="${props.color}">${props.text}</Button>`;
    case 'image':
      return `<img src="${props.src}" alt="${props.alt}" style={{ maxWidth: '100%', height: 'auto' }} />`;
    case 'filterArea':
      return `<FilterArea fields={${JSON.stringify(props.fields)}} />`;
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
