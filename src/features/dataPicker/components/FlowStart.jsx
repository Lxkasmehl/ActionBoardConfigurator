import { Card, Typography } from '@mui/joy';
import '@xyflow/react/dist/style.css';
import { Handle, Position } from '@xyflow/react';
import SettingsIcon from '@mui/icons-material/Settings';
import PropTypes from 'prop-types';

export default function FlowStart({ data }) {
  return (
    <Card
      sx={{
        alignItems: 'center',
        width: 200,
        paddingBottom: 3,
        border: data?.selected ? '2px solid #1976d2' : '1px solid #e0e0e0',
        boxShadow: data?.selected ? '0 0 10px rgba(25, 118, 210, 0.3)' : 'none',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        },
      }}
      data-testid='flow-start'
    >
      <SettingsIcon />
      <Typography level='title-lg' align='center'>
        Flow beginning
      </Typography>
      <Handle
        type='source'
        position={Position.Bottom}
        style={{
          width: '30px',
          height: '30px',
          color: 'white',
          fontSize: '12px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {' '}
        GO
      </Handle>
    </Card>
  );
}

FlowStart.propTypes = {
  data: PropTypes.object,
};
