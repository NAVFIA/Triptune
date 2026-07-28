import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Outlet />
    </Box>
  );
};
