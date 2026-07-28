import React from 'react';
import { Box, Typography } from '@mui/material';
import { PageHeader } from '../components/common/PageHeader';
import { EmptyState } from '../components/common/EmptyState';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';

export const DestinationsPage: React.FC = () => {
  return (
    <Box>
      <PageHeader
        title="Destinations"
        subtitle="Explore recommended destinations matching your travel profile"
      />
      <EmptyState
        title="Destination Recommendation UI"
        description="Destination browsing and recommendation UI will be connected in the next phase."
        icon={<ExploreOutlinedIcon sx={{ fontSize: 64, color: 'primary.main' }} />}
      />
    </Box>
  );
};
