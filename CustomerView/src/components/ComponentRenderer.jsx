import React from 'react';
import { Button, Box } from '@mui/joy';
import TextComponent from './TextComponent';
import FilterArea from './FilterArea';
import ButtonBar from './ButtonBar';
import TableComponent from './TableComponent';
import ChartComponent from './ChartComponent';
import ImageComponent from './ImageComponent';

const ComponentRenderer = ({ component, onFilterChange, onButtonClick }) => {
  const { type, props } = component;

  const renderComponent = () => {
    switch (type) {
      case 'heading':
      case 'paragraph':
        return <TextComponent component={component} />;

      case 'button':
        return (
          <Button
            {...props}
            sx={{ marginBottom: 2, width: '100%' }}
            onClick={() => onButtonClick?.(component)}
          >
            {props?.label || 'Click me'}
          </Button>
        );

      case 'filterArea':
        return (
          <FilterArea
            component={component}
            columnData={component.columnData || {}}
            tableColumns={component.tableColumns || {}}
            componentGroups={component.componentGroups || {}}
          />
        );

      case 'buttonBar':
        return (
          <ButtonBar
            component={component}
            onButtonClick={onButtonClick}
            fields={component.props?.fields}
            componentId={component.id}
            componentGroups={component.componentGroups}
            tableColumns={component.tableColumns}
            tableData={component.tableData}
          />
        );

      case 'table':
        return <TableComponent component={component} />;

      case 'chart':
        return <ChartComponent component={component} />;

      case 'image':
        return <ImageComponent component={component} />;

      default:
        return (
          <Box sx={{ p: 2, textAlign: 'center', border: '1px dashed #ccc' }}>
            <p>Unknown component type: {type}</p>
          </Box>
        );
    }
  };

  return <Box sx={{ marginBottom: 2 }}>{renderComponent()}</Box>;
};

export default ComponentRenderer;
