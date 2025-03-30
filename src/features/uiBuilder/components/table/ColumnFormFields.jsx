import PropTypes from 'prop-types';
import { FormControl, FormLabel, Input, Switch } from '@mui/joy';
import useFetchEntities from '../../../../shared/hooks/useFetchEntities';
import { sortEntities } from '../../../../shared/utils/entityOperations';
import { useSelector } from 'react-redux';
import { useMemo, useState } from 'react';
import EntityPropertyFields from './EntityPropertyFields';
import DynamicFormIcon from '@mui/icons-material/DynamicForm';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

export default function ColumnFormFields({ editedItem, setEditedItem }) {
  const filteredEntities = useSelector(
    (state) => state.entities.filteredEntities,
  );
  const sortedEntities = useMemo(
    () => sortEntities(filteredEntities),
    [filteredEntities],
  );
  const loading = useFetchEntities();
  const [isIFrame, setIsIFrame] = useState(false);

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
      <Switch
        startDecorator={<DynamicFormIcon />}
        endDecorator={<OpenInNewIcon />}
        checked={isIFrame}
        onChange={(e) => setIsIFrame(e.target.checked)}
        sx={{
          marginTop: '10px',
          '--Switch-gap': '20px',
        }}
      />
      {!isIFrame ? (
        <EntityPropertyFields
          editedItem={editedItem}
          setEditedItem={setEditedItem}
          sortedEntities={sortedEntities}
          loading={loading}
        />
      ) : (
        <iframe
          src='/data-picker'
          style={{
            width: '80vw',
            height: '50vh',
            borderRadius: '8px',
            border: '1px solid #ced8e2',
          }}
        />
      )}
    </>
  );
}

ColumnFormFields.propTypes = {
  editedItem: PropTypes.shape({
    label: PropTypes.string,
    entity: PropTypes.object,
    property: PropTypes.object,
    externalUrl: PropTypes.string,
  }).isRequired,
  setEditedItem: PropTypes.func.isRequired,
};
