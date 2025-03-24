import { IconButton } from '@mui/joy';
import { Edit } from '@mui/icons-material';
import PropTypes from 'prop-types';

export default function EditButton({ onClick }) {
  return (
    <IconButton
      size='xs'
      variant='plain'
      color='neutral'
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -53%)',
        opacity: 0,
        transition: 'opacity',
        width: '90%',
        height: '80%',
        '&:hover': {
          opacity: 0.8,
        },
      }}
      onClick={onClick}
    >
      <Edit />
    </IconButton>
  );
}

EditButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};
