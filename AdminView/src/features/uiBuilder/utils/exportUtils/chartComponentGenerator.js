export const generateChartComponent = () => {
  return `import React from 'react';
import { LineChart, BarChart, PieChart, ScatterChart } from '@mui/x-charts';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  components: {
    MuiChartsTooltip: {
      styleOverrides: {
        paper: {
          backgroundColor: 'white',
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          borderRadius: '4px',
        },
      },
    },
  },
});

export default function ChartComponent({ component }) {
  const renderChart = () => {
    switch (component.props.type) {
      case 'bars':
        return <BarChart {...component.props.data} height={300} />;
      case 'lines':
        return <LineChart {...component.props.data} height={300} />;
      case 'pie':
        return <PieChart {...component.props.data} height={300} />;
      case 'scatter':
        return <ScatterChart {...component.props.data} height={300} />;
      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      {renderChart()}
    </ThemeProvider>
  );
}`;
};
