import React from 'react';
import { Box, Typography, CardContent, Stack, Grid, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getTripsApi } from '../api/trip';
import { PageHeader } from '../components/common/PageHeader';
import { AppCard } from '../components/common/AppCard';
import { StatusChip } from '../components/common/StatusChip';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';

export const MyTripsPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    data: tripsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['trips', 'all'],
    queryFn: () => getTripsApi(0, 20),
  });

  const trips = tripsData?.data?.content || [];

  return (
    <Box>
      <PageHeader
        title="My Trips"
        subtitle="Manage and track all your created travel plans"
        action={
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/trips/create')}
          >
            Create Trip
          </Button>
        }
      />

      {isLoading && <LoadingSkeleton count={3} />}

      {isError && (
        <ErrorState
          title="Unable to load trips"
          message="Check backend status at http://localhost:8080"
          onRetry={refetch}
        />
      )}

      {!isLoading && !isError && trips.length === 0 && (
        <EmptyState
          title="No trips found"
          description="You haven't created any travel plans yet."
          actionText="Create New Trip"
          onAction={() => navigate('/trips/create')}
        />
      )}

      {!isLoading && !isError && trips.length > 0 && (
        <Stack spacing={2.5}>
          {trips.map((trip) => (
            <AppCard key={trip.tripId}>
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={8}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                      <Typography variant="h3" fontSize="1.25rem" fontWeight={700}>
                        {trip.tripName}
                      </Typography>
                      <StatusChip status={trip.status} />
                    </Box>

                    <Stack direction="row" spacing={3} sx={{ color: 'text.secondary', mt: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOnOutlinedIcon fontSize="small" color="action" />
                        <Typography variant="body2">Starting: {trip.startingLocation}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarMonthOutlinedIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {trip.startDate} to {trip.endDate} ({trip.numberOfDays} days)
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} sm={4} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                    {trip.perPersonBudget && (
                      <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                        ${trip.perPersonBudget} / person
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      {trip.numberOfTravellers} Traveler{trip.numberOfTravellers > 1 ? 's' : ''}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </AppCard>
          ))}
        </Stack>
      )}
    </Box>
  );
};
