import { Typography } from '@mui/joy';
import PropTypes from 'prop-types';

export const ColumnDragOverlay = ({ activeColumn, tableData }) => {
  if (!activeColumn) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #ced8e2',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#fbfcfe',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        minWidth: '150px',
        opacity: 0.7,
      }}
    >
      <div
        style={{
          position: 'relative',
          padding: 10,
          borderBottom: '1px solid #ced8e2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            cursor: 'grab',
            position: 'absolute',
            top: '-4px',
            left: '50%',
            transform: 'translateX(-50%)',
            rotate: '90deg',
            zIndex: 1000,
            borderRadius: '4px',
            backgroundColor: '#ced8e2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px 0px',
          }}
        >
          <span style={{ fontSize: 'small' }}>⋮</span>
        </div>
        <Typography
          level='title-sm'
          sx={{ textAlign: 'center', wordBreak: 'break-word' }}
        >
          {activeColumn.label}
        </Typography>
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {(tableData || []).map((row, index) => (
          <Typography
            key={index}
            level='body-sm'
            sx={{
              padding: 1,
              borderBottom:
                index === tableData.length - 1 ? 'none' : '1px solid #ced8e2',
              textAlign: 'center',
              minHeight: '38px',
            }}
          >
            {row[activeColumn.label]}
          </Typography>
        ))}
      </div>
    </div>
  );
};

ColumnDragOverlay.propTypes = {
  activeColumn: PropTypes.shape({
    label: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }),
  tableData: PropTypes.arrayOf(PropTypes.object).isRequired,
};
