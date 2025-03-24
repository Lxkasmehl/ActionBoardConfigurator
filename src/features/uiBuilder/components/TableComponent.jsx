import { Table, IconButton } from '@mui/joy';
import { COMPONENT_TYPES, COMPONENT_CONFIGS } from './constants';
import { Add, Edit } from '@mui/icons-material';
import { useState } from 'react';
import EditModal from './EditModal';

export default function TableComponent() {
  const [columns, setColumns] = useState(
    COMPONENT_CONFIGS[COMPONENT_TYPES.TABLE].defaultProps.columns,
  );
  const [hoveredColumn, setHoveredColumn] = useState(null);
  const [editingColumn, setEditingColumn] = useState(null);
  const [dummyData, setDummyData] = useState([
    {
      'User id': 1001,
      'Employee Name': 'John Smith',
      Gender: 'M',
      Country: 'USA',
    },
    {
      'User id': 1002,
      'Employee Name': 'Sarah Johnson',
      Gender: 'F',
      Country: 'Canada',
    },
  ]);

  const handleAddColumn = () => {
    const newColumnLabel = `Column ${columns.length + 1}`;
    const newColumn = {
      label: newColumnLabel,
      type: 'text',
    };

    setColumns([...columns, newColumn]);

    setDummyData(
      dummyData.map((row) => ({
        ...row,
        [newColumnLabel]: '',
      })),
    );
  };

  const handleEditColumn = (column) => {
    setEditingColumn(column);
  };

  const handleSaveColumn = (editedColumn) => {
    const newColumns = columns.map((col) =>
      col.label === editingColumn.label ? editedColumn : col,
    );
    setColumns(newColumns);

    const newData = dummyData.map((row) => {
      const newRow = { ...row };
      newRow[editedColumn.label] = newRow[editingColumn.label];
      delete newRow[editingColumn.label];
      return newRow;
    });
    setDummyData(newData);
  };

  const handleDeleteColumn = (columnLabel) => {
    setColumns(columns.filter((col) => col.label !== columnLabel));
    setDummyData(
      dummyData.map((row) => {
        const newRow = { ...row };
        delete newRow[columnLabel];
        return newRow;
      }),
    );
  };

  return (
    <>
      <Table borderAxis='bothBetween' color='neutral' variant='outlined'>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.label}
                style={{
                  whiteSpace: 'normal',
                  wordWrap: 'break-word',
                  verticalAlign: 'middle',
                  position: 'relative',
                }}
                onMouseEnter={() => setHoveredColumn(column.label)}
                onMouseLeave={() => setHoveredColumn(null)}
              >
                {column.label}
                {hoveredColumn === column.label && (
                  <IconButton
                    size='sm'
                    variant='plain'
                    color='neutral'
                    onClick={() => handleEditColumn(column)}
                    sx={{
                      position: 'absolute',
                      right: '4px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      opacity: 0.7,
                      '&:hover': {
                        opacity: 1,
                      },
                    }}
                  >
                    <Edit fontSize='small' />
                  </IconButton>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dummyData.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column.label}>{row[column.label]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
      <IconButton
        variant='solid'
        color='primary'
        onClick={handleAddColumn}
        sx={{
          position: 'absolute',
          top: '-10px',
          right: '-10px',
          borderRadius: '50%',
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
    </>
  );
}
