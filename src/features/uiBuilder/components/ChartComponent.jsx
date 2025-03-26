import { useState } from 'react';
import PropTypes from 'prop-types';
import { LineChart, BarChart, PieChart, ScatterChart } from '@mui/x-charts';
import { IconButton } from '@mui/joy';
import Edit from '@mui/icons-material/Edit';
import ChartEditModal from './ChartEditModal';

const sampleData = {
  lines: {
    xAxis: [{ data: [1, 2, 3, 4, 5] }],
    series: [{ data: [2, 5.5, 2, 8.5, 1.5] }],
  },
  bars: {
    xAxis: [{ data: ['A', 'B', 'C', 'D', 'E'], scaleType: 'band' }],
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [chartData, setChartData] = useState(
    component.props.data ||
      sampleData[component.props.type] ||
      sampleData.lines,
  );
  const [chartType, setChartType] = useState(component.props.type);

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleSave = (updatedComponent) => {
    setChartData(
      updatedComponent.props.data ||
        sampleData[updatedComponent.props.type] ||
        sampleData.lines,
    );
    setChartType(updatedComponent.props.type);
    setIsEditModalOpen(false);
  };

  const ChartWrapper = ({ children }) => (
    <>
      {children}
      <IconButton
        variant='solid'
        color='primary'
        onClick={handleEditClick}
        sx={{
          position: 'absolute',
          top: '-10px',
          right: '-10px',
          borderRadius: '50%',
        }}
      >
        <Edit />
      </IconButton>
      <ChartEditModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        component={{
          ...component,
          props: { ...component.props, data: chartData, type: chartType },
        }}
        onSave={handleSave}
      />
    </>
  );

  ChartWrapper.propTypes = {
    children: PropTypes.node.isRequired,
  };

  switch (chartType) {
    case 'bars':
      return (
        <ChartWrapper>
          <BarChart {...chartData} height={300} />
        </ChartWrapper>
      );
    case 'lines':
      return (
        <ChartWrapper>
          <LineChart {...chartData} height={300} />
        </ChartWrapper>
      );
    case 'pie':
      return (
        <ChartWrapper>
          <PieChart {...chartData} height={300} />
        </ChartWrapper>
      );
    case 'scatter':
      return (
        <ChartWrapper>
          <ScatterChart {...chartData} height={300} />
        </ChartWrapper>
      );
    default:
      return null;
  }
}

ChartComponent.propTypes = {
  component: PropTypes.shape({
    id: PropTypes.string.isRequired,
    props: PropTypes.shape({
      type: PropTypes.string.isRequired,
      data: PropTypes.object,
    }).isRequired,
  }).isRequired,
};
