import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  CardContent,
  Chip,
  Avatar,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LuggageOutlinedIcon from '@mui/icons-material/LuggageOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { getTripsApi } from '../api/trip';
import { getProfileApi } from '../api/profile';
import { PageHeader } from '../components/common/PageHeader';
import { AppCard } from '../components/common/AppCard';
import { StatusChip } from '../components/common/StatusChip';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    data: tripsData,
    isLoading: isLoadingTrips,
    isError: isErrorTrips,
    refetch: refetchTrips,
  } = useQuery({
    queryKey: ['trips', 0],
    queryFn: () => getTripsApi(0, 5),
  });

  const {
    data: profileData,
    isLoading: isLoadingProfile,
  } = useQuery({
    queryKey: ['profile'],
    queryFn: () => getProfileApi(),
    retry: false,
  });

  const trips = tripsData?.data?.content || [];
  const totalTrips = tripsData?.data?.totalElements || 0;
  const hasProfile = !!profileData?.data;

  return (
    <Box>
      <PageHeader
        title={`Welcome back, ${user?.fullName?.split(' ')[0] || 'Traveler'}! 👋`}
        subtitle="Ready to tune your next adaptive travel experience?"
        action={
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/trips/create')}
            size="large"
          >
            Plan a New Trip
          </Button>
        }
      />

      {/* Top Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <AppCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#E0F2FE', color: '#0284C7', width: 48, height: 48 }}>
                  <LuggageOutlinedIcon />
                </Avatar>
                <Chip
                  label={isLoadingTrips ? '...' : `${totalTrips} Total`}
                  size="small"
                  sx={{ bgcolor: '#F1F5F9', fontWeight: 600 }}
                />
              </Box>
              <Typography variant="h3" fontWeight={800} gutterBottom>
                {isLoadingTrips ? '...' : totalTrips}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Saved & Active Trips
              </Typography>
            </CardContent>
          </AppCard>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <AppCard onClick={() => navigate('/profile')}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#DCFCE7', color: '#16A34A', width: 48, height: 48 }}>
                  <PersonOutlineIcon />
                </Avatar>
                <Chip
                  label={hasProfile ? 'Complete' : 'Action Needed'}
                  size="small"
                  color={hasProfile ? 'success' : 'warning'}
                  sx={{ fontWeight: 600 }}
                />
              </Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                {isLoadingProfile ? 'Loading...' : hasProfile ? 'Travel Profile Set' : 'Setup Profile'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {hasProfile
                  ? `${profileData?.data?.preferredMoods?.length || 0} Moods & ${profileData?.data?.interests?.length || 0} Interests configured`
                  : 'Customize travel pace, mood & budget preferences'}
              </Typography>
            </CardContent>
          </AppCard>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <AppCard onClick={() => navigate('/destinations')}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Avatar sx={{ bgcolor: '#F3E8FF', color: '#9333EA', width: 48, height: 48 }}>
                  <ExploreOutlinedIcon />
                </Avatar>
                <ArrowForwardIcon color="action" fontSize="small" />
              </Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Explore Destinations
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Browse curated spots matching your mood & season
              </Typography>
            </CardContent>
          </AppCard>
        </Grid>
      </Grid>

      {/* Recent Trips Section */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h2" fontSize="1.35rem">
          Recent Trips
        </Typography>
        {trips.length > 0 && (
          <Button
            variant="text"
            color="primary"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/trips')}
          >
            View All Trips
          </Button>
        )}
      </Box>

      {isLoadingTrips && <LoadingSkeleton count={2} />}

      {isErrorTrips && (
        <ErrorState
          title="Could not load recent trips"
          message="Make sure your backend server is running on http://localhost:8080"
          onRetry={refetchTrips}
        />
      )}

      {!isLoadingTrips && !isErrorTrips && trips.length === 0 && (
        <EmptyState
          title="No trips created yet"
          description="Start your first travel plan with TripTune. Our mood-aware recommendation engine will find your perfect destination."
          actionText="Plan Your First Trip"
          onAction={() => navigate('/trips/create')}
        />
      )}

      {!isLoadingTrips && !isErrorTrips && trips.length > 0 && (
        <Stack spacing={2}>
          {trips.map((trip) => (
            <AppCard
              key={trip.tripId}
              onClick={() => navigate(`/trips`)}
              sx={{ '&:hover': { backgroundColor: '#FAFAFA' } }}
            >
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={8}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                      <Typography variant="h3" fontSize="1.15rem" fontWeight={700}>
                        {trip.tripName}
                      </Typography>
                      <StatusChip status={trip.status} />
                    </Box>

                    <Stack direction="row" spacing={3} sx={{ color: 'text.secondary', mt: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOnOutlinedIcon fontSize="small" color="action" />
                        <Typography variant="body2">From {trip.startingLocation}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarMonthOutlinedIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {trip.startDate} to {trip.endDate} ({trip.numberOfDays} days)
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    sm={4}
                    sx={{ textAlign: { xs: 'left', sm: 'right' } }}
                  >
                    {trip.perPersonBudget && (
                      <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                        ${trip.perPersonBudget} / person
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary" display="block">
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
