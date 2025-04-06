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
  const [mainEntity, setMainEntity] = useState(null);
  const [editingColumn, setEditingColumn] = useState(null);
  const [tableData, setTableData, isLoading] = useTableData(
    columns,
    getInitialDummyData(),
  );

  const isColumnInvalid = (column) => {
    return (
      column.entity &&
      !column.isMainEntity &&
      mainEntity &&
      column.entity.name !== mainEntity.name
    );
  };

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
    if (editedColumn.isMainEntity) {
      // If this column is being set as main entity, unset any other main entity
      setMainEntity(editedColumn.entity);
      setColumns((prevColumns) =>
        prevColumns.map((col) => ({
          ...col,
          isMainEntity: col.id === editedColumn.id,
        })),
      );
    }

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
      if (columnToDelete.isMainEntity) {
        setMainEntity(null);
      }
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

  console.log('columns', columns);

  const gridColumns = columns.map((column) => {
    const isInvalid = isColumnInvalid(column);
    return {
      field: column.label,
      headerName: column.label,
      minWidth: 100,
      flex: 1,
      resizable: true,
      editable: !column.data && !column.entity,
      type: column.type || 'string',
      columnId: column.id,
      headerClassName: isInvalid ? 'invalid-column-header' : '',
      cellClassName: isInvalid ? 'invalid-column-cell' : '',
      description: isInvalid
        ? `This column's entity (${column.entity.name}) does not match the main entity (${mainEntity.name}). Either make it the main entity or choose a different entity.`
        : '',
    };
  });

  // Sort columns to put main entity first
  const sortedColumns = [...gridColumns].sort((a, b) => {
    const colA = columns.find((col) => col.id === a.columnId);
    const colB = columns.find((col) => col.id === b.columnId);
    if (colA.isMainEntity) return -1;
    if (colB.isMainEntity) return 1;
    return 0;
  });

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
        columns={sortedColumns}
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
          '& .invalid-column-header': {
            backgroundColor: 'rgba(255, 0, 0, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 0, 0, 0.15)',
            },
          },
          '& .invalid-column-cell': {
            backgroundColor: 'rgba(255, 0, 0, 0.05)',
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
          mainEntity={mainEntity}
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
