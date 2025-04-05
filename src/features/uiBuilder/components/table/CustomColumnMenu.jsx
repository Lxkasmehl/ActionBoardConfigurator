import { GridColumnMenu } from '@mui/x-data-grid-pro';
import EditItem from './EditItem';
import PropTypes from 'prop-types';

export default function CustomColumnMenu({ onEditColumn, ...props }) {
  if (!props.colDef) return null;

  return (
    <GridColumnMenu
      {...props}
      slots={{
        columnMenuUserItem: EditItem,
        columnMenuFilterItem: null,
      }}
      slotProps={{
        columnMenuUserItem: {
          displayOrder: 1,
          editValue: 'Edit Column',
          editHandler: () => onEditColumn(props.colDef.columnId),
        },
      }}
    />
  );
}

CustomColumnMenu.propTypes = {
  onEditColumn: PropTypes.func.isRequired,
  colDef: PropTypes.shape({
    columnId: PropTypes.string.isRequired,
    field: PropTypes.string.isRequired,
    headerName: PropTypes.string,
    type: PropTypes.string,
  }).isRequired,
  api: PropTypes.object,
  currentColumn: PropTypes.object,
};
