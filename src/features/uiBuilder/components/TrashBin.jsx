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
      sx={{
        position: 'absolute',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 60,
        height: 60,
        borderRadius: '50%',
        bgcolor: 'danger.500',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease',
        color: 'white',
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
