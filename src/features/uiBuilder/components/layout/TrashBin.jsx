import { IconButton } from '@mui/joy';
import { Delete } from '@mui/icons-material';
import { useDroppable } from '@dnd-kit/core';
import PropTypes from 'prop-types';
import { useEffect } from 'react';

export default function TrashBin({ isVisible, onOverChange }) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'trash-bin',
    data: { type: 'trash-bin' },
  });

  useEffect(() => {
    onOverChange(isOver);
  }, [isOver, onOverChange]);

  if (!isVisible) return null;

  return (
    <IconButton
      ref={setNodeRef}
      color='danger'
      variant='solid'
      sx={{
        position: 'fixed',
        bottom: 40,
        left: 'calc(50% + 150px)',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 60,
        height: 60,
        borderRadius: '50%',
        zIndex: 100,
      }}
    >
      <Delete />
    </IconButton>
  );
}

TrashBin.propTypes = {
  isVisible: PropTypes.bool.isRequired,
  onOverChange: PropTypes.func.isRequired,
};
