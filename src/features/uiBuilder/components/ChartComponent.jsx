import PropTypes from 'prop-types';
import { LineChart, BarChart, PieChart, ScatterChart } from '@mui/x-charts';

const sampleData = {
  lines: {
    xAxis: [{ data: [1, 2, 3, 4, 5] }],
    series: [{ data: [2, 5.5, 2, 8.5, 1.5] }],
  },
  bars: {
    xAxis: [{ data: ['A', 'B', 'C', 'D', 'E'] }],
    series: [{ data: [2, 5.5, 2, 8.5, 1.5] }],
  },
  pie: {
    series: [
      {
        data: [
          { id: 0, value: 10 },
          { id: 1, value: 15 },
          { id: 2, value: 20 },
        ],
      },
    ],
  },
  scatter: {
    xAxis: [{ data: [1, 2, 3, 4, 5] }],
    series: [
      {
        data: [
          { x: 1, y: 2 },
          { x: 2, y: 5.5 },
          { x: 3, y: 2 },
          { x: 4, y: 8.5 },
          { x: 5, y: 1.5 },
        ],
      },
    ],
  },
};

export default function ChartComponent({ component }) {
  const data = sampleData[component.props.type] || sampleData.lines;

  switch (component.props.type) {
    case 'bars':
      return <BarChart {...data} height={300} />;
    case 'lines':
      return <LineChart {...data} height={300} />;
    case 'pie':
      return <PieChart {...data} height={300} />;
    case 'scatter':
      return <ScatterChart {...data} height={300} />;
    default:
      return null;
  }
}

ChartComponent.propTypes = {
  component: PropTypes.object.isRequired,
};
