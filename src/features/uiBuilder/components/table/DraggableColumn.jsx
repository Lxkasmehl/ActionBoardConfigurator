import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import PropTypes from 'prop-types';
import { DragIndicator, Edit } from '@mui/icons-material';
import { IconButton } from '@mui/joy';

export default function DraggableColumn({
  column,
  onEdit,
  isHovered,
  isColumnHovered,
  onMouseEnter,
  onMouseLeave,
  data,
  onHeaderMouseEnter,
  onHeaderMouseLeave,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.label,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    display: 'table-cell',
    position: 'relative',
    border: isColumnHovered && '2px solid #ced8e2',
    padding: 0,
  };

  return (
    <td
      ref={setNodeRef}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <table>
        <thead>
          <tr>
            <th
              style={{
                whiteSpace: 'normal',
                wordWrap: 'break-word',
                position: 'relative',
                cursor: 'grab',
                width: '100vw',
              }}
              onMouseEnter={() => onHeaderMouseEnter(column.label)}
              onMouseLeave={() => onHeaderMouseLeave()}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  overflow: 'visible',
                }}
              >
                <div
                  {...attributes}
                  {...listeners}
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
                    display: isColumnHovered ? 'flex' : 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px 0px',
                  }}
                >
                  <DragIndicator fontSize='small' />
                </div>
                {column.label}
                <div style={{ width: '32px', height: '32px' }}>
                  {isHovered && (
                    <IconButton
                      size='sm'
                      variant='plain'
                      color='neutral'
                      onClick={() => onEdit(column)}
                    >
                      <Edit fontSize='small' />
                    </IconButton>
                  )}
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td
                style={{
                  display: 'block',
                }}
              >
                {row[column.label]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </td>
  );
}

DraggableColumn.propTypes = {
  column: PropTypes.shape({
    label: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  isHovered: PropTypes.bool.isRequired,
  isColumnHovered: PropTypes.bool.isRequired,
  onMouseEnter: PropTypes.func.isRequired,
  onMouseLeave: PropTypes.func.isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  onHeaderMouseEnter: PropTypes.func.isRequired,
  onHeaderMouseLeave: PropTypes.func.isRequired,
};
