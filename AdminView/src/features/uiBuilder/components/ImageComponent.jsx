import {
  Box,
  IconButton,
  Modal,
  Input,
  Button,
  Stack,
  ModalDialog,
  ModalClose,
  Typography,
  ToggleButtonGroup,
} from '@mui/joy';
import { Edit, Upload, Link } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { updateComponentProps } from '@/redux/uiBuilderSlice';

export default function ImageComponent({ component, disabled = false }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState(component.props.src);
  const [currentImageUrl, setCurrentImageUrl] = useState(component.props.src);
  const [inputMode, setInputMode] = useState('url'); // 'url' or 'file'
  const [uploadedFileName, setUploadedFileName] = useState('');
  const fileInputRef = useRef(null);

  const handleOpen = () => {
    setTempImageUrl(currentImageUrl);
    setOpen(true);
  };

  const handleClose = () => {
    setTempImageUrl(currentImageUrl);
    setOpen(false);
    setUploadedFileName('');
  };

  const handleSave = () => {
    setCurrentImageUrl(tempImageUrl);
    setOpen(false);
    dispatch(
      updateComponentProps({
        componentId: component.id,
        props: { src: tempImageUrl },
      }),
    );
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputModeChange = (event, newMode) => {
    if (newMode !== null) {
      setInputMode(newMode);
      setTempImageUrl('');
      setUploadedFileName('');
    }
  };

  return (
    <>
      <Box
        component='img'
        src={currentImageUrl}
        alt={component.props.alt}
        sx={{
          maxWidth: '100%',
          height: 'auto',
        }}
      />
      <IconButton
        variant='solid'
        color='primary'
        sx={{
          position: 'absolute',
          top: '-10px',
          right: '-10px',
          borderRadius: '50%',
          display: disabled ? 'none' : 'block',
        }}
        disabled={disabled}
        onClick={handleOpen}
      >
        <Edit />
      </IconButton>

      <Modal
        open={open}
        onClose={handleClose}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ModalDialog>
          <ModalClose />
          <Stack spacing={2} sx={{ mt: 3 }}>
            <Typography level='h4'>Edit Image</Typography>

            <ToggleButtonGroup
              value={inputMode}
              onChange={handleInputModeChange}
              sx={{ width: '100%' }}
            >
              <Button value='url' startDecorator={<Link />}>
                Image URL
              </Button>
              <Button value='file' startDecorator={<Upload />}>
                Upload File
              </Button>
            </ToggleButtonGroup>

            {inputMode === 'url' ? (
              <Input
                placeholder='Enter image URL'
                value={tempImageUrl}
                onChange={(e) => setTempImageUrl(e.target.value)}
                fullWidth
              />
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button component='label' variant='outlined' fullWidth>
                  {uploadedFileName || 'Choose a file'}
                  <input
                    type='file'
                    hidden
                    accept='image/*'
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                  />
                </Button>
                {uploadedFileName && (
                  <Typography level='body-sm' sx={{ color: 'success.500' }}>
                    File selected: {uploadedFileName}
                  </Typography>
                )}
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button variant='plain' onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </Box>
          </Stack>
        </ModalDialog>
      </Modal>
    </>
  );
}

ImageComponent.propTypes = {
  component: PropTypes.shape({
    id: PropTypes.string.isRequired,
    props: PropTypes.shape({
      src: PropTypes.string.isRequired,
      alt: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  disabled: PropTypes.bool,
};
