import { Box, Typography } from '@mui/joy';
import PropTypes from 'prop-types';

const BORDER_STYLES = {
  DASHED: '2px dashed',
  NONE: 'none',
};

const getEmptyStateStyles = (isOver) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  border: BORDER_STYLES.DASHED,
  borderColor: isOver ? 'primary.500' : 'divider',
  borderRadius: 'sm',
  bgcolor: isOver ? 'background.level2' : 'transparent',
});

export default function EmptyState({ isOver }) {
  return (
    <Box sx={getEmptyStateStyles(isOver)}>
      <Typography level='body-lg' color='neutral'>
        Drag and drop components here
      </Typography>
    </Box>
  );
}

EmptyState.propTypes = {
  isOver: PropTypes.bool.isRequired,
};
