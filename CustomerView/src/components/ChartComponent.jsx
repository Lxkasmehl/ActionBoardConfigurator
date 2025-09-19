import React from 'react';
import { LineChart, BarChart, PieChart, ScatterChart } from '@mui/x-charts';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Typography } from '@mui/joy';

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
  const { props } = component;
  const { type, data, title, height = 300 } = props || {};

  const renderChart = () => {
    if (!data) {
      return (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography color='warning'>No chart data available</Typography>
        </Box>
      );
    }

    const commonProps = {
      ...data,
      height,
    };

    switch (type) {
      case 'bars':
        return <BarChart {...commonProps} />;
      case 'lines':
        return <LineChart {...commonProps} />;
      case 'pie':
        return <PieChart {...commonProps} />;
      case 'scatter':
        return <ScatterChart {...commonProps} />;
      default:
        return (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color='warning'>
              Unsupported chart type: {type}
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ marginBottom: 2 }}>
      {title && (
        <Typography level='h4' sx={{ marginBottom: 2 }}>
          {title}
        </Typography>
      )}
      <ThemeProvider theme={theme}>{renderChart()}</ThemeProvider>
    </Box>
  );
}
