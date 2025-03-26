import PropTypes from 'prop-types';

export default function ChartComponent({ component }) {
  return <div>ChartComponent</div>;
}

ChartComponent.propTypes = {
  component: PropTypes.object.isRequired,
};
