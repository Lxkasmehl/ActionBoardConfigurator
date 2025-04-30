export const generateChartComponent = () => {
  return `import React from 'react';
import { Box, Typography } from '@mui/joy';

export default function ChartComponent({ data }) {
  return (
    <Box 
      sx={{ 
        padding: 2, 
        border: '1px solid', 
        borderColor: 'divider', 
        borderRadius: 'sm',
        width: '100%'
      }}
    >
      <Typography level="h4" sx={{ marginBottom: 2 }}>Chart</Typography>
      <Box 
        sx={{ 
          height: 300, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: 'background.level1',
          borderRadius: 'sm'
        }}
      >
        <Typography>Chart visualization would go here</Typography>
      </Box>
    </Box>
  );
}`;
};
