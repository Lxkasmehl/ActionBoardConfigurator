import { Table } from '@mui/joy';
import { DragIndicator } from '@mui/icons-material';
import PropTypes from 'prop-types';

export const ColumnDragOverlay = ({ activeColumn, dummyData }) => {
  if (!activeColumn) return null;

  return (
    <Table
      borderAxis='bothBetween'
      color='neutral'
      variant='outlined'
      sx={{
        borderRadius: 0,
        border: '2px solid #ced8e2',
      }}
    >
      <thead>
        <tr>
          <th
            style={{
              whiteSpace: 'normal',
              wordWrap: 'break-word',
              verticalAlign: 'middle',
              position: 'relative',
              cursor: 'grabbing',
              backgroundColor: 'background.level1',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              opacity: 0.8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                <DragIndicator fontSize='small' />
              </div>
              {activeColumn.label}
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        {dummyData.map((row, index) => (
          <tr key={index}>
            <td>{row[activeColumn.label]}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

ColumnDragOverlay.propTypes = {
  activeColumn: PropTypes.shape({
    label: PropTypes.string.isRequired,
  }),
  dummyData: PropTypes.arrayOf(PropTypes.object).isRequired,
};
