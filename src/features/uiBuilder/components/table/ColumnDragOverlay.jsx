import PropTypes from 'prop-types';
import { Table } from '@mui/joy';

export const ColumnDragOverlay = ({ activeColumn, tableData }) => {
  if (!activeColumn) return null;

  return (
    <Table borderAxis='bothBetween' color='neutral' variant='outlined'>
      <thead>
        <tr>
          <th
            style={{
              whiteSpace: 'normal',
              wordWrap: 'break-word',
              position: 'relative',
              cursor: 'grab',
              width: '100%',
              overflow: 'visible',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
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
              {activeColumn.label}
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        {(tableData || []).map((row, index) => (
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
    type: PropTypes.string.isRequired,
  }),
  tableData: PropTypes.arrayOf(PropTypes.object).isRequired,
};
