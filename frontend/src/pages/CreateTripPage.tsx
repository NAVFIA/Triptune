import React from 'react';
import { Box } from '@mui/material';
import { PageHeader } from '../components/common/PageHeader';
import { EmptyState } from '../components/common/EmptyState';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

export const CreateTripPage: React.FC = () => {
  return (
    <Box>
      <PageHeader
        title="Plan a New Trip"
        subtitle="Configure your trip details, duration, budget, and travel preferences"
      />
      <EmptyState
        title="Trip Creation Form"
        description="Trip creation wizard and recommendation engine UI will be implemented in the next phase."
        icon={<AddCircleOutlineIcon sx={{ fontSize: 64, color: 'secondary.main' }} />}
      />
    </Box>
  );
};
