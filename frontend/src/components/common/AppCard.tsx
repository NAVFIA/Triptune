import React from 'react';
import { Card, CardProps } from '@mui/material';

export const AppCard: React.FC<CardProps> = ({ children, sx, ...props }) => {
  return (
    <Card
      {...props}
      sx={{
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': props.onClick
          ? {
              transform: 'translateY(-2px)',
              boxShadow: '0 10px 25px -3px rgba(15, 23, 42, 0.1)',
              cursor: 'pointer',
            }
          : undefined,
        ...sx,
      }}
    >
      {children}
    </Card>
  );
};
