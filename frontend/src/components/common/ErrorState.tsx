import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/Error';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an error loading this information. Please try again.',
  onRetry,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        textAlign: 'center',
        backgroundColor: '#FEF2F2',
        borderRadius: 3,
        border: '1px solid #FCA5A5',
        my: 2,
      }}
    >
      <ErrorOutlineIcon sx={{ fontSize: 48, color: 'error.main', mb: 1 }} />
      <Typography variant="h6" color="error.main" sx={{ fontWeight: 700 }} gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450, mb: onRetry ? 2 : 0 }}>
        {message}
      </Typography>
      {onRetry && (
        <Button variant="outlined" color="error" size="small" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </Box>
  );
};
