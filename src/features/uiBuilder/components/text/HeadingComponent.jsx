import { Input } from '@mui/joy';
import PropTypes from 'prop-types';
import EditableTextComponent from './EditableTextComponent';

export default function HeadingComponent({ component }) {
  return (
    <EditableTextComponent
      component={component}
      InputComponent={Input}
      typographyProps={{ level: component.props.level || 'h2' }}
    />
  );
}

HeadingComponent.propTypes = {
  component: PropTypes.shape({
    props: PropTypes.shape({
      level: PropTypes.string,
      text: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};
