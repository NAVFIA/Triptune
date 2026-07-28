import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 3,
      }}
    >
      <MapOutlinedIcon sx={{ fontSize: 96, color: 'text.disabled', mb: 2 }} />
      <Typography variant="h1" fontSize="3rem" fontWeight={800} color="primary.main">
        404
      </Typography>
      <Typography variant="h2" fontSize="1.5rem" fontWeight={700} sx={{ mt: 1, mb: 1 }}>
        Destination Not Found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 450, mb: 4 }}>
        The page or travel route you are looking for does not exist or has been moved.
      </Typography>
      <Button variant="contained" color="primary" onClick={() => navigate('/dashboard')}>
        Return to Dashboard
      </Button>
    </Box>
  );
};
