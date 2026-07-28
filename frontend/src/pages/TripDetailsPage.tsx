import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, CircularProgress, Chip } from '@mui/material';
import { PageHeader } from '../components/common/PageHeader';
import { getTripApi } from '../api/trip';
import type { Trip } from '../types/trip';

export const TripDetailsPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!tripId) return;
    const fetchTrip = async () => {
      try {
        const data = await getTripApi(Number(tripId));
        setTrip(data.data);
      } catch (err) {
        setError('Failed to fetch trip details');
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [tripId]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error || !trip) return <Typography color="error" sx={{ mt: 4 }}>{error || 'Trip not found'}</Typography>;

  return (
    <Box>
      <PageHeader
        title={trip.tripName}
        subtitle={`${trip.startDate} to ${trip.endDate}`}
        action={
          !trip.selectedDestination ? (
            <Button variant="contained" color="primary" onClick={() => navigate(`/trips/${trip.tripId}/destinations`)}>
              Get Destination Recommendations
            </Button>
          ) : null
        }
      />
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>Trip Overview</Typography>
        <Typography><strong>Status:</strong> <Chip label={trip.status} size="small" color="primary" sx={{ ml: 1 }} /></Typography>
        <Typography><strong>Starting Location:</strong> {trip.startingLocation}</Typography>
        <Typography><strong>Travellers:</strong> {trip.numberOfTravellers} ({trip.travellerType})</Typography>
        <Typography><strong>Total Budget:</strong> ${trip.totalBudget}</Typography>
        <Typography><strong>Travel Pace:</strong> {trip.travelPace}</Typography>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>Selected Destination</Typography>
          {trip.selectedDestination ? (
            <Box>
              <Typography variant="body1"><strong>{trip.selectedDestination.name}</strong>, {trip.selectedDestination.country}</Typography>
              {trip.selectedDestination.description && (
                <Typography variant="body2" sx={{ mt: 1 }}>{trip.selectedDestination.description}</Typography>
              )}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">No destination selected yet.</Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
};
