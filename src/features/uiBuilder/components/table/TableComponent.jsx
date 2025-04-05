import { IconButton } from '@mui/joy';
import { Add } from '@mui/icons-material';
import { useState } from 'react';
import EditModal from '../common/EditModal';
import PropTypes from 'prop-types';
import { useTableData } from '../../hooks/useTableData';
import { getInitialDummyData } from '../../utils/tableUtils';
import { DataGridPro } from '@mui/x-data-grid-pro';
import CustomColumnMenu from './CustomColumnMenu';

export default function TableComponent({ component }) {
  const [columns, setColumns] = useState(component.props.columns);
  const [editingColumn, setEditingColumn] = useState(null);
  const [tableData, setTableData] = useTableData(
    columns,
    getInitialDummyData(),
  );

  const handleAddColumn = () => {
    const newColumnLabel = `Column ${columns.length + 1}`;
    const newColumn = {
      label: newColumnLabel,
      type: 'text',
    };

    setColumns([...columns, newColumn]);
  };

  const handleEditColumn = (columnField) => {
    const column = columns.find((col) => col.label === columnField);
    setEditingColumn(column);
  };

  const handleSaveColumn = (editedColumn) => {
    // Ensure the column has a type
    const columnWithType = {
      ...editedColumn,
      type: editedColumn.type || 'text',
    };

    const newColumns = columns.map((col) =>
      col.label === editingColumn.label ? columnWithType : col,
    );
    setColumns(newColumns);

    // If we have direct data from the iframe, update the table data
    if (editedColumn.data) {
      setTableData((prevData) => {
        const maxRows = Math.max(prevData.length, editedColumn.data.length);
        return Array.from({ length: maxRows }, (_, index) => ({
          ...(prevData[index] || {}),
          [editedColumn.label]: editedColumn.data[index] || '',
        }));
      });
    }
  };

  const handleDeleteColumn = (columnLabel) => {
    setColumns(columns.filter((col) => col.label !== columnLabel));
    setTableData(
      tableData.map((row) => {
        const newRow = { ...row };
        delete newRow[columnLabel];
        return newRow;
      }),
    );
  };

  const gridColumns = columns.map((column) => ({
    field: column.label,
    headerName: column.label,
    minWidth: 100,
    maxWidth: 250,
    flex: 1,
    resizable: true,
    editable: false,
    type: column.type || 'string',
    renderHeader: () => (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          gap: 4,
        }}
      >
        <span>{column.label}</span>
      </div>
    ),
  }));

  // Add a unique id to each row for the Data Grid
  const rows = tableData.map((row, index) => ({
    id: index,
    ...row,
  }));

  return (
    <div
      style={{ maxHeight: 500, width: '100%', maxWidth: 'calc(100vw - 460px)' }}
    >
      <DataGridPro
        rows={rows}
        columns={gridColumns}
        disableRowSelectionOnClick
        experimentalFeatures={{ newEditingApi: true }}
        columnReordering
        slots={{
          columnMenu: (props) => (
            <CustomColumnMenu {...props} onEditColumn={handleEditColumn} />
          ),
        }}
        sx={{
          zIndex: 10000,
        }}
      />
      <IconButton
        variant='solid'
        color='primary'
        onClick={handleAddColumn}
        sx={{
          position: 'absolute',
          top: '-10px',
          right: '-10px',
          borderRadius: '50%',
          zIndex: 1000,
        }}
      >
        <Add />
      </IconButton>
      {editingColumn && (
        <EditModal
          open={!!editingColumn}
          onClose={() => setEditingColumn(null)}
          item={editingColumn}
          onSave={handleSaveColumn}
          onDelete={handleDeleteColumn}
          type='column'
          title='Edit Column'
        />
      )}
    </div>
  );
}

TableComponent.propTypes = {
  component: PropTypes.shape({
    props: PropTypes.shape({
      columns: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          type: PropTypes.string.isRequired,
          entity: PropTypes.string,
          property: PropTypes.string,
        }),
      ).isRequired,
    }).isRequired,
  }).isRequired,
};
