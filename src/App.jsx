import { Button, Stack } from '@mui/joy';
import { useNavigate } from 'react-router-dom';

export default function App() {
  const navigate = useNavigate();

  return (
    <div className='flex justify-center items-center min-h-screen bg-gray-50'>
      <Stack spacing={2} direction='row'>
        <Button
          size='lg'
          variant='solid'
          color='primary'
          onClick={() => navigate('/entity-explorer')}
        >
          Entity Explorer
        </Button>
        <Button
          size='lg'
          variant='solid'
          color='primary'
          onClick={() => navigate('/ui-builder')}
        >
          UI Builder
        </Button>
      </Stack>
    </div>
  );
}
