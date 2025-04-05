import { GridColumnMenu } from '@mui/x-data-grid-pro';
import EditItem from './EditItem';
import DeleteItem from './DeleteItem';
import PropTypes from 'prop-types';

export default function CustomColumnMenu({
  onEditColumn,
  onDeleteColumn,
  ...props
}) {
  if (!props.colDef) return null;

  return (
    <GridColumnMenu
      {...props}
      slots={{
        columnMenuEditItem: EditItem,
        columnMenuFilterItem: null,
        columnMenuDeleteItem: DeleteItem,
      }}
      slotProps={{
        columnMenuEditItem: {
          displayOrder: 1,
          editValue: 'Edit Column',
          editHandler: () => onEditColumn(props.colDef.columnId),
        },
        columnMenuDeleteItem: {
          displayOrder: 2,
          deleteValue: 'Delete Column',
          deleteHandler: () => onDeleteColumn(props.colDef.columnId),
        },
      }}
    />
  );
}

CustomColumnMenu.propTypes = {
  onEditColumn: PropTypes.func.isRequired,
  onDeleteColumn: PropTypes.func.isRequired,
  colDef: PropTypes.shape({
    columnId: PropTypes.string.isRequired,
    field: PropTypes.string.isRequired,
    headerName: PropTypes.string,
    type: PropTypes.string,
  }).isRequired,
  api: PropTypes.object,
  currentColumn: PropTypes.object,
};
