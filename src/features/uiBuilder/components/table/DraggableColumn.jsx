import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import PropTypes from 'prop-types';
import { DragIndicator, Edit } from '@mui/icons-material';
import { IconButton, Typography } from '@mui/joy';

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
  isLastColumn,
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
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    borderRight: isLastColumn ? 'none' : '1px solid #ced8e2',
    borderTop: 'none',
    borderLeft: 'none',
    padding: 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        style={{
          position: 'relative',
          padding: 10,
          borderBottom: '2px solid #ced8e2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          maxHeight: '41px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
        onMouseEnter={() => onHeaderMouseEnter(column.label)}
        onMouseLeave={() => onHeaderMouseLeave()}
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            justifyContent: 'center',
          }}
        >
          <Typography level='title-sm' style={{ textAlign: 'center' }}>
            {column.label}
          </Typography>
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
      <div style={{ flex: 1, overflow: 'auto' }}>
        {data.map((row, index) => (
          <Typography
            key={index}
            level='body-sm'
            sx={{
              padding: 1,
              borderBottom:
                index === data.length - 1 ? 'none' : '1px solid #ced8e2',
              textAlign: 'center',
              wordBreak: 'break-word',
              minHeight: '38px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
            }}
          >
            {row[column.label]}
          </Typography>
        ))}
      </div>
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
  isColumnHovered: PropTypes.bool.isRequired,
  onMouseEnter: PropTypes.func.isRequired,
  onMouseLeave: PropTypes.func.isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  onHeaderMouseEnter: PropTypes.func.isRequired,
  onHeaderMouseLeave: PropTypes.func.isRequired,
  isLastColumn: PropTypes.bool.isRequired,
};
