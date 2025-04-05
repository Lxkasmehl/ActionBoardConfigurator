import PropTypes from 'prop-types';
import { MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { Delete } from '@mui/icons-material';

export default function DeleteItem(props) {
  const { deleteHandler, deleteValue } = props;
  return (
    <MenuItem onClick={deleteHandler}>
      <ListItemIcon>
        <Delete fontSize='small' />
      </ListItemIcon>
      <ListItemText>{deleteValue}</ListItemText>
    </MenuItem>
  );
}

DeleteItem.propTypes = {
  deleteHandler: PropTypes.func.isRequired,
  deleteValue: PropTypes.string.isRequired,
};
