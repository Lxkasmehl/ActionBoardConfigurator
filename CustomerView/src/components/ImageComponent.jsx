import React from 'react';
import { Box } from '@mui/joy';
import PropTypes from 'prop-types';

export default function ImageComponent({ component }) {
  const { props } = component;
  const { src, alt = '', style = {} } = props || {};

  // Default styles for image display
  const defaultStyle = {
    width: '100%',
    height: 'auto',
    display: 'block',
    margin: '0 auto',
    ...style,
  };

  return <Box component='img' src={src} alt={alt} sx={defaultStyle} />;
}

ImageComponent.propTypes = {
  component: PropTypes.shape({
    id: PropTypes.string.isRequired,
    props: PropTypes.shape({
      src: PropTypes.string.isRequired,
      alt: PropTypes.string,
      style: PropTypes.object,
    }).isRequired,
  }).isRequired,
};
