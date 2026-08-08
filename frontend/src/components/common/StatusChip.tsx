import React from 'react';
import { Chip } from '@mui/material';
import type { ChipProps } from '@mui/material';

interface StatusChipProps extends Omit<ChipProps, 'color'> {
  status: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, ...props }) => {
  const getStatusColor = (st: string): { bg: string; text: string; label: string } => {
    switch (st.toUpperCase()) {
      case 'DRAFT':
        return { bg: '#F1F5F9', text: '#475569', label: 'Draft' };
      case 'DESTINATION_RECOMMENDED':
        return { bg: '#E0F2FE', text: '#0369A1', label: 'Destination Recommended' };
      case 'DESTINATION_SELECTED':
        return { bg: '#FEF3C7', text: '#B45309', label: 'Destination Selected' };
      case 'ITINERARY_GENERATED':
        return { bg: '#EDE9FE', text: '#6D28D9', label: 'Itinerary Generated' };
      case 'CONFIRMED':
        return { bg: '#D1FAE5', text: '#047857', label: 'Planned' };
      case 'IN_PROGRESS':
        return { bg: '#D1FAE5', text: '#047857', label: 'In Progress' };
      case 'COMPLETED':
        return { bg: '#DCFCE7', text: '#15803D', label: 'Completed' };
      case 'CANCELLED':
        return { bg: '#FEE2E2', text: '#B91C1C', label: 'Cancelled' };
      default:
        return { bg: '#F1F5F9', text: '#475569', label: st.replace(/_/g, ' ') };
    }
  };

  const style = getStatusColor(status);

  return (
    <Chip
      label={style.label}
      size="small"
      {...props}
      sx={{
        backgroundColor: style.bg,
        color: style.text,
        fontWeight: 600,
        fontSize: '0.75rem',
        borderRadius: '6px',
        ...props.sx,
      }}
    />
  );
};
