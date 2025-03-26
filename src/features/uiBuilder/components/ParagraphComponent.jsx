import { Textarea } from '@mui/joy';
import PropTypes from 'prop-types';
import EditableTextComponent from './EditableTextComponent';

export default function ParagraphComponent({ component }) {
  return (
    <EditableTextComponent
      component={component}
      InputComponent={Textarea}
      inputProps={{ minRows: 3 }}
    />
  );
}

ParagraphComponent.propTypes = {
  component: PropTypes.shape({
    props: PropTypes.shape({
      text: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};
