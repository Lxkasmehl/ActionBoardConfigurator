import PropTypes from 'prop-types';
import { FormControl, FormLabel, Input, Select, Option } from '@mui/joy';
import useFetchEntities from '../../../../shared/hooks/useFetchEntities';
import { sortEntities } from '../../../../shared/utils/entityOperations';
import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import EntityPropertyFields from './EntityPropertyFields';

export default function ColumnFormFields({ editedItem, setEditedItem }) {
  const filteredEntities = useSelector(
    (state) => state.entities.filteredEntities,
  );
  const sortedEntities = useMemo(
    () => sortEntities(filteredEntities),
    [filteredEntities],
  );
  const loading = useFetchEntities();

  return (
    <>
      <FormControl>
        <FormLabel>Label</FormLabel>
        <Input
          value={editedItem.label}
          onChange={(e) =>
            setEditedItem({ ...editedItem, label: e.target.value })
          }
          placeholder='Enter column label'
        />
      </FormControl>
      <FormControl>
        <FormLabel>Type</FormLabel>
        <Select
          value={editedItem.type}
          onChange={(_, value) => setEditedItem({ ...editedItem, type: value })}
          sx={{ minWidth: 200 }}
        >
          <Option value='text'>Text</Option>
          <Option value='number'>Number</Option>
          <Option value='date'>Date</Option>
          <Option value='boolean'>Boolean</Option>
          <Option value='entity'>Entity</Option>
        </Select>
      </FormControl>
      {editedItem.type === 'entity' && (
        <EntityPropertyFields
          editedItem={editedItem}
          setEditedItem={setEditedItem}
          sortedEntities={sortedEntities}
          loading={loading}
        />
      )}
    </>
  );
}

ColumnFormFields.propTypes = {
  editedItem: PropTypes.shape({
    label: PropTypes.string,
    type: PropTypes.string,
    entity: PropTypes.object,
    property: PropTypes.object,
  }).isRequired,
  setEditedItem: PropTypes.func.isRequired,
};
