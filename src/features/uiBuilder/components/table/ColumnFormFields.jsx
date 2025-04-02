import PropTypes from 'prop-types';
import { FormControl, FormLabel, Input, Switch, Typography } from '@mui/joy';
import useFetchEntities from '../../../../shared/hooks/useFetchEntities';
import { sortEntities } from '../../../../shared/utils/entityOperations';
import { useSelector } from 'react-redux';
import { useMemo, useState } from 'react';
import EntityPropertyFields from './EntityPropertyFields';

export default function ColumnFormFields({ editedItem, setEditedItem }) {
  const filteredEntities = useSelector(
    (state) => state.fetchedData.filteredEntities,
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
      <div className='my-3'>
        <Typography level='title-md' sx={{ textAlign: 'center' }}>
          How to choose data for column
        </Typography>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '10px',
            gap: '20px',
          }}
        >
          <Typography
            sx={{ flex: 1, textAlign: 'right', whiteSpace: 'nowrap' }}
          >
            Form Fields
          </Typography>
          <Switch
            checked={isIFrame}
            onChange={(e) => setIsIFrame(e.target.checked)}
            sx={{
              '--Switch-gap': '20px',
            }}
          />
          <Typography sx={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap' }}>
            DataPicker Flow
          </Typography>
        </div>
      </div>

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
