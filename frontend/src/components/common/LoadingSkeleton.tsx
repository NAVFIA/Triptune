import React from 'react';
import { Box, Skeleton, Card, CardContent } from '@mui/material';

interface LoadingSkeletonProps {
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ count = 3 }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
      {Array.from(new Array(count)).map((_, index) => (
        <Card key={index} variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Skeleton variant="text" width="40%" height={32} />
            <Skeleton variant="text" width="70%" height={24} sx={{ my: 1 }} />
            <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2, mt: 2 }} />
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};
