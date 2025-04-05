import { GridColumnMenu } from '@mui/x-data-grid-pro';
import EditItem from './EditItem';
import PropTypes from 'prop-types';

export default function CustomColumnMenu({ onEditColumn, ...props }) {
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
          editHandler: () => onEditColumn(props.colDef.field),
        },
      }}
    />
  );
}

CustomColumnMenu.propTypes = {
  onEditColumn: PropTypes.func.isRequired,
  colDef: PropTypes.object.isRequired,
};
