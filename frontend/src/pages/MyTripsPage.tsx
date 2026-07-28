import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, CardActions, Chip, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { getTripsApi } from '../api/trip';
import type { Trip } from '../types/trip';

export const MyTripsPage: React.FC = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const data = await getTripsApi(0, 100);
        setTrips(data.data.content);
      } catch (error) {
        console.error('Failed to fetch trips', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  return (
    <Box>
      <PageHeader
        title="My Trips"
        subtitle="Manage your upcoming and past trips"
        action={
          <Button variant="contained" color="primary" onClick={() => navigate('/trips/create')}>
            Plan New Trip
          </Button>
        }
      />
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : trips.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">You haven't planned any trips yet.</Typography>
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {trips.map(trip => (
            <Grid size={{xs: 12, md: 6, lg: 4}}   key={trip.tripId}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" gutterBottom>{trip.tripName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {trip.startDate} to {trip.endDate}
                  </Typography>
                  <Box sx={{ mt: 2, mb: 1 }}>
                    <Chip label={trip.status} color="primary" size="small" />
                  </Box>
                  <Typography variant="body2">Budget: ${trip.totalBudget}</Typography>
                  <Typography variant="body2">Traveller Type: {trip.travellerType}</Typography>
                  {trip.selectedDestination && (
                    <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                      Destination: {trip.selectedDestination.name}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => navigate(`/trips/${trip.tripId}`)}>View Details</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};
