import React from 'react';
import { Box, Typography, CardContent, Grid, Chip, Divider, Stack } from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import MoodOutlinedIcon from '@mui/icons-material/MoodOutlined';
import InterestsOutlinedIcon from '@mui/icons-material/InterestsOutlined';
import DirectionBusOutlinedIcon from '@mui/icons-material/DirectionBusOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import { useQuery } from '@tanstack/react-query';
import { getProfileApi } from '../api/profile';
import { useAuth } from '../hooks/useAuth';
import { PageHeader } from '../components/common/PageHeader';
import { AppCard } from '../components/common/AppCard';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  const {
    data: profileData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['profile'],
    queryFn: () => getProfileApi(),
  });

  const profile = profileData?.data;

  return (
    <Box>
      <PageHeader
        title="Travel Profile"
        subtitle="Your personalized travel preferences used by TripTune recommendations"
      />

      <Grid container spacing={3}>
        {/* User Identity Card */}
        <Grid item xs={12} md={4}>
          <AppCard>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <PersonOutlineIcon sx={{ fontSize: 64, color: 'primary.main', mb: 1 }} />
              <Typography variant="h3" fontSize="1.25rem" fontWeight={700} gutterBottom>
                {user?.fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user?.email}
              </Typography>
              <Chip label={user?.role || 'USER'} size="small" color="primary" sx={{ mt: 1, fontWeight: 600 }} />
            </CardContent>
          </AppCard>
        </Grid>

        {/* Travel Preferences */}
        <Grid item xs={12} md={8}>
          {isLoading && <LoadingSkeleton count={2} />}

          {isError && (
            <ErrorState
              title="No profile data found"
              message="Your travel profile has not been created yet or backend is offline."
              onRetry={refetch}
            />
          )}

          {!isLoading && !isError && !profile && (
            <EmptyState
              title="No travel profile created yet"
              description="Your profile helps our recommendation engine tailor destinations to your mood, pace, and transport preferences."
            />
          )}

          {!isLoading && !isError && profile && (
            <Stack spacing={3}>
              <AppCard>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h3" fontSize="1.15rem" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <MoodOutlinedIcon color="primary" /> Preferred Moods
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {profile.preferredMoods?.length ? (
                      profile.preferredMoods.map((mood) => (
                        <Chip key={mood} label={mood.replace(/_/g, ' ')} color="primary" variant="outlined" />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">No preferred moods configured.</Typography>
                    )}
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant="h3" fontSize="1.15rem" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <InterestsOutlinedIcon color="secondary" /> Interests
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {profile.interests?.length ? (
                      profile.interests.map((interest) => (
                        <Chip key={interest} label={interest.replace(/_/g, ' ')} color="secondary" variant="outlined" />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">No interests configured.</Typography>
                    )}
                  </Box>
                </CardContent>
              </AppCard>

              <AppCard>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h3" fontSize="1.15rem" fontWeight={700} sx={{ mb: 2 }}>
                    Travel Style & Limits
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="text.secondary">Default Traveller Type</Typography>
                      <Typography variant="body1" fontWeight={600}>{profile.defaultTravellerType || 'Not set'}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="text.secondary">Preferred Travel Pace</Typography>
                      <Typography variant="body1" fontWeight={600}>{profile.preferredTravelPace || 'Not set'}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="text.secondary">Transport Preference</Typography>
                      <Typography variant="body1" fontWeight={600}>{profile.preferredTransport || 'Not set'}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="text.secondary">Crowd Tolerance</Typography>
                      <Typography variant="body1" fontWeight={600}>{profile.crowdTolerance ? `${profile.crowdTolerance} / 10` : 'Not set'}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="text.secondary">Max Travel Distance</Typography>
                      <Typography variant="body1" fontWeight={600}>{profile.maximumTravelDistance ? `${profile.maximumTravelDistance} km` : 'Not set'}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={4}>
                      <Typography variant="caption" color="text.secondary">Max Walking Distance</Typography>
                      <Typography variant="body1" fontWeight={600}>{profile.maximumWalkingDistance ? `${profile.maximumWalkingDistance} km` : 'Not set'}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </AppCard>
            </Stack>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};
