import { useState } from 'react';
import { IconButton } from '@mui/joy';
import { Edit } from '@mui/icons-material';
import PropTypes from 'prop-types';
import EditButtonBarModal from './EditButtonBarModal';
import ButtonField from './ButtonField';
import { useSelector, useDispatch } from 'react-redux';
import SortModal from './SortModal';
import {
  setSortModalOpen,
  setSortConfig,
} from '../../../../redux/uiBuilderSlice';

export default function ButtonBar({ component, disabled = false }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const dispatch = useDispatch();
  const sortModalOpen = useSelector((state) => state.uiBuilder.sortModalOpen);
  const componentGroups = useSelector(
    (state) => state.uiBuilder.componentGroups,
  );

  const componentGroup = Object.values(componentGroups).find((group) =>
    group.components.includes(component.id),
  );

  const groupName = Object.keys(componentGroups).find(
    (key) => componentGroups[key] === componentGroup,
  );

  const handleEditButtonBar = () => {
    setIsEditModalOpen(true);
  };

  const handleSave = (updatedComponent) => {
    component.props.fields = updatedComponent.props.fields;
  };

  const handleApplySort = (field, direction) => {
    dispatch(setSortConfig({ groupName, config: { field, direction } }));
  };

  return (
    <>
      <div className='flex gap-2 flex-wrap'>
        {component.props.fields.map((field, index) => (
          <ButtonField
            key={index}
            field={{ ...field, id: index + 1 }}
            disabled={disabled}
            groupName={groupName}
            componentId={component.id}
          />
        ))}
      </div>
      {!disabled && (
        <IconButton
          variant='solid'
          color='primary'
          onClick={handleEditButtonBar}
          sx={{
            position: 'absolute',
            top: '-10px',
            right: '-10px',
            borderRadius: '50%',
          }}
        >
          <Edit />
        </IconButton>
      )}
      <EditButtonBarModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        component={component}
        onSave={handleSave}
      />
      <SortModal
        open={sortModalOpen}
        onClose={() => dispatch(setSortModalOpen(false))}
        onApplySort={handleApplySort}
        componentId={component.id}
      />
    </>
  );
}

ButtonBar.propTypes = {
  component: PropTypes.shape({
    id: PropTypes.string.isRequired,
    props: PropTypes.shape({
      fields: PropTypes.arrayOf(
        PropTypes.shape({
          type: PropTypes.string.isRequired,
          'text/icon': PropTypes.string.isRequired,
        }),
      ).isRequired,
    }).isRequired,
  }).isRequired,
  disabled: PropTypes.bool,
};
