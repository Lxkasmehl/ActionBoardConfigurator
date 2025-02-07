import { useDispatch, useSelector } from 'react-redux';
import Dropdown from './Dropdown';
import { addEntity } from '../redux/entitiesSlice';

export default function EntitySection() {
  const dispatch = useDispatch();
  const filteredEntities = useSelector(
    (state) => state.entities.filteredEntities,
  );

  const handleDropdownChange = (selectedValue) => {
    dispatch(addEntity(selectedValue));
  };

  return (
    <section className='flex items-center justify-around px-6 py-8 bg-gray-800 lg:w-[50em] lg:min-h-[4em] w-[90%] min-h-[4.5em] text-white rounded-lg shadow-lg'>
      <div className='flex flex-col justify-center items-center'>
        <Dropdown
          id='dropdown-left'
          options={filteredEntities}
          defaultValue='Select an entity'
          onChange={handleDropdownChange}
        />
      </div>

      <div className='flex flex-col justify-center items-center'>
        <Dropdown
          id='dropdown-center'
          options={[
            { value: '1', label: 'Option 1' },
            { value: '2', label: 'Option 2' },
            { value: '3', label: 'Option 3' },
          ]}
          defaultValue='Select an option'
        />
        <input
          type='text'
          placeholder='Eingabe hier'
          className='bg-gray-600 text-white rounded px-2 py-1 mt-4'
        />
      </div>

      <div className='flex flex-col justify-center items-end'>
        <Dropdown
          id='dropdown-right'
          options={[
            { value: '1', label: 'Option 1' },
            { value: '2', label: 'Option 2' },
            { value: '3', label: 'Option 3' },
          ]}
          defaultValue='Select an option'
        />
      </div>
    </section>
  );
}
