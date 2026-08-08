import React from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, CardActions, CircularProgress } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '../components/common/PageHeader';
import { ErrorState } from '../components/common/ErrorState';
import { StatusChip } from '../components/common/StatusChip';
import { getTripsApi } from '../api/trip';

export const MyTripsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filterPlanned = searchParams.get('filter') === 'planned';

  const {
    data: tripsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['trips'],
    queryFn: () => getTripsApi(0, 100),
  });

  const rawTrips = tripsData?.data.content ?? [];
  const trips = rawTrips.filter((trip) => {
    if (filterPlanned) {
      return trip.status === 'CONFIRMED';
    } else {
      return trip.status !== 'CONFIRMED';
    }
  });

  return (
    <Box>
      <PageHeader
        title={filterPlanned ? "Planned Trips" : "My Trips"}
        subtitle={filterPlanned ? "View and access your finalized and confirmed itineraries" : "Manage your upcoming drafts and recommendation plans"}
        action={
          <Button variant="contained" color="primary" onClick={() => navigate('/trips/create')}>
            Plan New Trip
          </Button>
        }
      />
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <ErrorState message="Failed to load trips" onRetry={() => refetch()} />
      ) : trips.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            {filterPlanned ? "You haven't confirmed any trips yet." : "You haven't planned any trips yet."}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {trips.map((trip) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={trip.tripId}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" gutterBottom>{trip.tripName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {trip.startDate} to {trip.endDate}
                  </Typography>
                  <Box sx={{ mt: 2, mb: 1 }}>
                    <StatusChip status={trip.status} />
                  </Box>
                  <Typography variant="body2">
                    Budget: ${trip.perPersonBudget ?? trip.totalBudget} per person
                  </Typography>
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
