import { Table } from '@mui/joy';
import { COMPONENT_TYPES, COMPONENT_CONFIGS } from './constants';

export default function TableComponent() {
  const columns = COMPONENT_CONFIGS[COMPONENT_TYPES.TABLE].defaultProps.columns;

  const dummyData = [
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
  ];

  return (
    <Table borderAxis='bothBetween' color='neutral' variant='outlined'>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.label}>{column.label}</th>
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
  );
}
