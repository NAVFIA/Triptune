import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';

export const PublicLayout: React.FC = () => {
  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <TopBar />
      <Box component="main">
        <Outlet />
      </Box>
    </Box>
  );
};
