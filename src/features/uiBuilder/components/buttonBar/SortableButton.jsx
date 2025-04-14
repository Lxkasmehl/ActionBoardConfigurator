import PropTypes from 'prop-types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconButton, Tooltip } from '@mui/joy';
import { Delete } from '@mui/icons-material';
import ButtonField from './ButtonField';

export default function SortableButton({ button, index, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: button['text/icon'] });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className='relative group'>
        <Tooltip title={button.description}>
          <div>
            <ButtonField field={button} onClickDisabled={true} />
          </div>
        </Tooltip>
        <IconButton
          variant='plain'
          color='danger'
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onRemove(index);
          }}
          sx={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            borderRadius: '50%',
            padding: '2px',
            fontSize: '0.75rem',
          }}
        >
          <Delete fontSize='small' />
        </IconButton>
      </div>
    </div>
  );
}

SortableButton.propTypes = {
  button: PropTypes.shape({
    type: PropTypes.string.isRequired,
    'text/icon': PropTypes.string.isRequired,
    description: PropTypes.string,
    onClick: PropTypes.func,
  }).isRequired,
  index: PropTypes.number.isRequired,
  onRemove: PropTypes.func.isRequired,
};
