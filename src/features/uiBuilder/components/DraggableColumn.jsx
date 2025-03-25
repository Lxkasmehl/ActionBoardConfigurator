import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import PropTypes from 'prop-types';
import { DragIndicator, Edit } from '@mui/icons-material';
import { IconButton } from '@mui/joy';

export default function DraggableColumn({
  column,
  onEdit,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  data,
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
  };

  return (
    <div ref={setNodeRef} style={style}>
      <th
        style={{
          whiteSpace: 'normal',
          wordWrap: 'break-word',
          position: 'relative',
          cursor: 'grab',
          width: '100vw',
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div {...attributes} {...listeners} style={{ cursor: 'grab' }}>
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
      {data.map((row, index) => (
        <td key={index} style={{ display: 'block' }}>
          {row[column.label]}
        </td>
      ))}
    </div>
  );
}

DraggableColumn.propTypes = {
  column: PropTypes.shape({
    label: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  isHovered: PropTypes.bool.isRequired,
  onMouseEnter: PropTypes.func.isRequired,
  onMouseLeave: PropTypes.func.isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};
