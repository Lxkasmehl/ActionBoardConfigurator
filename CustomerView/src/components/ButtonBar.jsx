import React from 'react';
import { Box, Button, ButtonGroup } from '@mui/joy';

export default function ButtonBar({ component, onButtonClick }) {
  const { props } = component;
  const { buttons = [], orientation = 'horizontal' } = props || {};

  const handleButtonClick = (button) => {
    onButtonClick?.(button);
  };

  return (
    <Box sx={{ marginBottom: 2 }}>
      <ButtonGroup
        orientation={orientation}
        variant='outlined'
        sx={{ flexWrap: 'wrap', gap: 1 }}
      >
        {buttons.map((button, index) => (
          <Button
            key={button.id || index}
            variant={button.variant || 'outlined'}
            color={button.color || 'primary'}
            size={button.size || 'md'}
            onClick={() => handleButtonClick(button)}
            disabled={button.disabled}
            startDecorator={button.startIcon}
            endDecorator={button.endIcon}
          >
            {button.label || `Button ${index + 1}`}
          </Button>
        ))}
      </ButtonGroup>
    </Box>
  );
}
