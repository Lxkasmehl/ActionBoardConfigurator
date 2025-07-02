import PropTypes from 'prop-types';
import {
  Modal,
  ModalDialog,
  Button,
  Typography,
  FormControl,
  FormLabel,
  Autocomplete,
} from '@mui/joy';

const CustomRelationModal = ({
  open,
  onClose,
  mainEntity,
  currentEntity,
  onSave,
  selectedMainEntityProp,
  setSelectedMainEntityProp,
  selectedCurrentEntityProp,
  setSelectedCurrentEntityProp,
}) => {
  const mainEntityProps = mainEntity?.properties?.properties || [];
  const currentEntityProps = currentEntity?.properties?.properties || [];

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog>
        <Typography level='h4'>Define Custom Relationship</Typography>
        <FormControl sx={{ mt: 2 }}>
          <FormLabel>Main Entity Property</FormLabel>
          <Autocomplete
            value={selectedMainEntityProp || null}
            options={mainEntityProps}
            placeholder='Select property from main entity'
            onChange={(_, value) => setSelectedMainEntityProp(value)}
            getOptionLabel={(option) => option.Name}
            isOptionEqualToValue={(option, value) =>
              option?.Name === value?.Name
            }
          />
        </FormControl>
        <FormControl sx={{ mt: 2 }}>
          <FormLabel>Current Entity Property</FormLabel>
          <Autocomplete
            value={selectedCurrentEntityProp || null}
            options={currentEntityProps}
            placeholder='Select property from current entity'
            onChange={(_, value) => setSelectedCurrentEntityProp(value)}
            getOptionLabel={(option) => option.Name}
            isOptionEqualToValue={(option, value) =>
              option?.Name === value?.Name
            }
          />
        </FormControl>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
            marginTop: '16px',
          }}
        >
          <Button variant='plain' color='neutral' onClick={onClose}>
            Cancel
          </Button>
          <Button variant='solid' color='primary' onClick={onSave}>
            Save
          </Button>
        </div>
      </ModalDialog>
    </Modal>
  );
};

CustomRelationModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  mainEntity: PropTypes.shape({
    properties: PropTypes.shape({
      properties: PropTypes.array,
    }),
  }),
  currentEntity: PropTypes.shape({
    properties: PropTypes.shape({
      properties: PropTypes.array,
    }),
  }),
  onSave: PropTypes.func.isRequired,
  selectedMainEntityProp: PropTypes.object,
  setSelectedMainEntityProp: PropTypes.func.isRequired,
  selectedCurrentEntityProp: PropTypes.object,
  setSelectedCurrentEntityProp: PropTypes.func.isRequired,
};

export default CustomRelationModal;
