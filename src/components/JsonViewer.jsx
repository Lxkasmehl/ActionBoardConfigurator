import { useState } from 'react';
import { Button, Typography } from '@mui/joy';
import PropTypes from 'prop-types';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

function JsonViewer({ data, level = 0 }) {
  const [isExpanded, setIsExpanded] = useState(level < 1);

  if (data === null) return <span style={{ color: '#666' }}>null</span>;
  if (typeof data !== 'object') {
    if (typeof data === 'string')
      return <span style={{ color: '#22863a' }}>{data}</span>;
    return <span style={{ color: '#005cc5' }}>{String(data)}</span>;
  }

  const isArray = Array.isArray(data);
  const isEmpty = Object.keys(data).length === 0;

  if (isEmpty) {
    return <span>{isArray ? '[]' : '{}'}</span>;
  }

  return (
    <div style={{ paddingLeft: level > 0 ? 20 : 0 }}>
      {level > 0 && (
        <Button
          variant='plain'
          color='neutral'
          startDecorator={
            isExpanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />
          }
          onClick={() => setIsExpanded(!isExpanded)}
          sx={{
            p: 0,
            minWidth: 'auto',
            color: 'text.primary',
            fontFamily: 'monospace',
            '&:hover': { backgroundColor: 'transparent' },
          }}
        >
          {isArray ? `[${Object.keys(data).length}]` : '{...}'}
        </Button>
      )}

      {(isExpanded || level === 0) && (
        <div
          style={{
            paddingLeft: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: level === 0 ? '16px' : '4px',
          }}
        >
          {Object.entries(data).map(([key, value]) => (
            <div
              key={key}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                padding: level === 0 ? '12px' : '2px',
                backgroundColor: level === 0 ? '#f5f5f5' : 'transparent',
                borderRadius: level === 0 ? '8px' : '0',
                minWidth: '600px',
              }}
            >
              <Typography
                component='span'
                sx={{
                  fontFamily: 'monospace',
                  color: '#24292e',
                  mr: 0.5,
                  fontWeight: level === 0 ? 600 : 400,
                }}
              >
                {isArray ? '' : `${key}: `}
              </Typography>
              <JsonViewer data={value} level={level + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

JsonViewer.propTypes = {
  data: PropTypes.any.isRequired,
  level: PropTypes.number,
};

export default JsonViewer;
