import React from 'react';
import { Typography } from '@mui/joy';

export default function TextComponent({ component }) {
  const { type, props } = component;
  const { text, level, color, align } = props || {};

  const getTypographyProps = () => {
    const baseProps = {
      sx: {
        color: color || 'inherit',
        textAlign: align || 'left',
        marginBottom: 2,
      },
    };

    switch (type) {
      case 'heading':
        return {
          ...baseProps,
          level: level || 'h3',
        };
      case 'paragraph':
        return {
          ...baseProps,
          level: 'body1',
        };
      default:
        return baseProps;
    }
  };

  return (
    <Typography {...getTypographyProps()}>{text || 'Sample text'}</Typography>
  );
}
