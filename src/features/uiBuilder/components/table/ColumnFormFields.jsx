import PropTypes from 'prop-types';
import { FormControl, FormLabel, Input } from '@mui/joy';
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
      <EntityPropertyFields
        editedItem={editedItem}
        setEditedItem={setEditedItem}
        sortedEntities={sortedEntities}
        loading={loading}
      />
    </>
  );
}

ColumnFormFields.propTypes = {
  editedItem: PropTypes.shape({
    label: PropTypes.string,
    entity: PropTypes.object,
    property: PropTypes.object,
  }).isRequired,
  setEditedItem: PropTypes.func.isRequired,
};
