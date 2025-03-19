import { Autocomplete, FormLabel } from '@mui/joy';

export default function FilterArea() {
  return (
    <div className='flex flex-col gap-2 flex-wrap max-h-[190px]'>
      {[...Array(9)].map((_, index) => (
        <div key={index} className='flex flex-col gap-1'>
          <FormLabel size='sm'>Filter {index + 1}</FormLabel>
          <Autocomplete
            size='sm'
            placeholder='Select an option'
            options={[]}
            sx={{ width: '90%' }}
          />
        </div>
      ))}
    </div>
  );
}
