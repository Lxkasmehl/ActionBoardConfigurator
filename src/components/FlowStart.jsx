import { Card, Typography } from '@mui/joy';
import '@xyflow/react/dist/style.css';
import { Handle, Position } from '@xyflow/react';
import SettingsIcon from '@mui/icons-material/Settings';

export default function FlowStart() {
  return (
    <Card
      sx={{
        alignItems: 'center',
        width: 200,
        paddingBottom: 3,
      }}
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
