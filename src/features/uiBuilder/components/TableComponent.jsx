import { Table, IconButton } from '@mui/joy';
import { COMPONENT_TYPES, COMPONENT_CONFIGS } from './constants';
import { Add } from '@mui/icons-material';
import { useState } from 'react';

export default function TableComponent() {
  const [columns, setColumns] = useState(
    COMPONENT_CONFIGS[COMPONENT_TYPES.TABLE].defaultProps.columns,
  );
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
                }}
              >
                {column.label}
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
    </>
  );
}
