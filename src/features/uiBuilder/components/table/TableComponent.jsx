import { IconButton } from '@mui/joy';
import { Add } from '@mui/icons-material';
import { useState } from 'react';
import EditModal from '../common/EditModal';
import PropTypes from 'prop-types';
import { useTableData } from '../../hooks/useTableData';
import { getInitialDummyData } from '../../utils/tableUtils';
import { DataGridPro } from '@mui/x-data-grid-pro';
import CustomColumnMenu from './CustomColumnMenu';
import CustomToolbar from './CustomToolbar';

export default function TableComponent({ component }) {
  const [columns, setColumns] = useState(
    component.props.columns.map((col) => ({
      ...col,
      id: crypto.randomUUID(),
    })),
  );
  const [editingColumn, setEditingColumn] = useState(null);
  const [tableData, setTableData, isLoading] = useTableData(
    columns,
    getInitialDummyData(),
  );

  const handleAddColumn = () => {
    const existingNumbers = columns.map((col) => {
      const match = col.label.match(/Column (\d+)/);
      return match ? parseInt(match[1]) : 0;
    });
    const maxNumber = Math.max(0, ...existingNumbers);

    let newNumber = maxNumber + 1;
    while (columns.some((col) => col.label === `Column ${newNumber}`)) {
      newNumber++;
    }

    const newColumnLabel = `Column ${newNumber}`;
    const newColumn = {
      id: crypto.randomUUID(),
      label: newColumnLabel,
    };

    setColumns([...columns, newColumn]);
  };

  const handleEditColumn = (columnId) => {
    const column = columns.find((col) => col.id === columnId);
    setEditingColumn(column);
  };

  const handleSaveColumn = (editedColumn) => {
    if (editedColumn.data) {
      if (editedColumn.isNewColumn) {
        const newColumn = {
          ...editedColumn,
          id: crypto.randomUUID(),
        };
        setColumns((prevColumns) => [...prevColumns, newColumn]);
      } else {
        setColumns((prevColumns) =>
          prevColumns.map((col) =>
            col.id === editingColumn.id ? editedColumn : col,
          ),
        );
      }

      setTableData((prevData) => {
        const maxRows = Math.max(prevData.length, editedColumn.data.length);
        return Array.from({ length: maxRows }, (_, index) => ({
          ...(prevData[index] || {}),
          [editedColumn.label]: editedColumn.data[index] || '',
        }));
      });
    } else {
      setColumns((prevColumns) =>
        prevColumns.map((col) =>
          col.id === editingColumn.id ? editedColumn : col,
        ),
      );
    }
  };

  const handleDeleteColumn = (columnId) => {
    const columnToDelete = columns.find((col) => col.id === columnId);
    if (columnToDelete) {
      setColumns(columns.filter((col) => col.id !== columnId));
      setTableData(
        tableData.map((row) => {
          const newRow = { ...row };
          delete newRow[columnToDelete.label];
          return newRow;
        }),
      );
    }
  };

  const gridColumns = columns.map((column) => ({
    field: column.label,
    headerName: column.label,
    minWidth: 100,
    flex: 1,
    resizable: true,
    editable: !column.data && !column.entity,
    type: column.type || 'string',
    columnId: column.id,
  }));

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
        hideFooter
        loading={isLoading}
        slots={{
          toolbar: CustomToolbar,
          columnMenu: (props) => (
            <CustomColumnMenu
              {...props}
              onEditColumn={handleEditColumn}
              onDeleteColumn={handleDeleteColumn}
            />
          ),
        }}
        sx={{
          '& .MuiDataGrid-cell': {
            borderRight: '1px solid rgba(224, 224, 224, 1)',
          },
          '& .MuiDataGrid-cell:last-child': {
            borderRight: 'none',
          },
          '& .MuiDataGrid-columnHeaders': {
            borderBottom: '1px solid rgba(224, 224, 224, 1)',
            borderTop: '1px solid rgba(224, 224, 224, 1)',
          },
          '& .MuiDataGrid-columnHeader': {
            borderRight: '1px solid rgba(224, 224, 224, 1)',
          },
          '& .MuiDataGrid-columnHeader:last-child': {
            borderRight: 'none',
          },
          '& .MuiDataGrid-row:last-child .MuiDataGrid-cell': {
            borderBottom: 'none',
          },
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
