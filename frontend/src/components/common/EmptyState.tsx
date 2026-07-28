import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon = <ExploreOutlinedIcon sx={{ fontSize: 64, color: 'text.disabled' }} />,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 6,
        textAlign: 'center',
        borderRadius: 4,
        backgroundColor: '#FFFFFF',
        border: '1px stroke #E2E8F0',
        my: 2,
      }}
    >
      {icon}
      <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mb: actionText ? 3 : 0 }}>
        {description}
      </Typography>
      {actionText && onAction && (
        <Button variant="contained" color="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </Box>
  );
};
