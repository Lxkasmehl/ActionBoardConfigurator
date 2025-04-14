import PropTypes from 'prop-types';
import { MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { Edit } from '@mui/icons-material';

export default function EditItem(props) {
  const { editHandler, editValue } = props;
  return (
    <MenuItem onClick={editHandler}>
      <ListItemIcon>
        <Edit fontSize='small' />
      </ListItemIcon>
      <ListItemText>{editValue}</ListItemText>
    </MenuItem>
  );
}

EditItem.propTypes = {
  editHandler: PropTypes.func.isRequired,
  editValue: PropTypes.string.isRequired,
};
