import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  CardContent, 
  Grid, 
  Chip, 
  Divider, 
  Stack, 
  Button, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  OutlinedInput,
  FormHelperText,
  Alert,
  CircularProgress
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/AccountCircle';
import MoodOutlinedIcon from '@mui/icons-material/MoodOutlined';
import InterestsOutlinedIcon from '@mui/icons-material/InterestsOutlined';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import HistoryIcon from '@mui/icons-material/History';

import { useQuery } from '@tanstack/react-query';
import { getProfileApi, createProfileApi, updateProfileApi } from '../api/profile';
import { getTripsApi } from '../api/trip';
import { useAuth } from '../hooks/useAuth';
import { PageHeader } from '../components/common/PageHeader';
import { AppCard } from '../components/common/AppCard';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import type { UserTravelProfile } from '../types/profile';

const AVAILABLE_MOODS = [
  'RELAXED', 'ADVENTUROUS', 'ROMANTIC', 'SOCIAL', 'SPIRITUAL', 
  'CURIOUS', 'CELEBRATORY', 'PEACEFUL', 'FOOD_FOCUSED', 
  'NATURE_FOCUSED', 'ENERGETIC', 'ESCAPE_FROM_STRESS'
];

const AVAILABLE_INTERESTS = [
  'CULTURE', 'ADVENTURE', 'ROMANTIC', 'FOOD', 'SOCIAL', 'NATURE', 'WELLNESS'
];

const TRAVELLER_TYPES = ['SOLO', 'COUPLE', 'FAMILY', 'FRIENDS', 'PARENTS_WITH_CHILDREN'];
const TRAVEL_PACES = ['RELAXED', 'BALANCED', 'PACKED'];

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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

  const {
    data: tripsData,
    isLoading: isLoadingTrips,
  } = useQuery({
    queryKey: ['trips'],
    queryFn: () => getTripsApi(0, 100),
  });

  const trips = tripsData?.data?.content || [];
  const todayStr = new Date().toISOString().split('T')[0];

  const confirmedTrips = trips.filter((t) => t.status === 'CONFIRMED');
  const upcomingTrips = confirmedTrips.filter((t) => t.startDate >= todayStr);
  const pastTrips = confirmedTrips.filter((t) => t.endDate < todayStr);

  // Form State
  const [formData, setFormData] = useState<Partial<UserTravelProfile>>({
    preferredMoods: [],
    interests: [],
    defaultTravellerType: 'SOLO',
    preferredTravelPace: 'BALANCED',
    preferredTransport: 'Car',
    maximumTravelDistance: 500,
    crowdTolerance: 5,
    maximumWalkingDistance: 10,
    dietaryPreferences: '',
    accessibilityRequirements: '',
    preferredWakeUpTime: '08:00:00',
    preferredSleepTime: '22:00:00'
  });

  // Sync profile data to form when loaded
  useEffect(() => {
    if (profile) {
      setFormData({
        preferredMoods: profile.preferredMoods || [],
        interests: profile.interests || [],
        defaultTravellerType: profile.defaultTravellerType || 'SOLO',
        preferredTravelPace: profile.preferredTravelPace || 'BALANCED',
        preferredTransport: profile.preferredTransport || 'Car',
        maximumTravelDistance: profile.maximumTravelDistance || 500,
        crowdTolerance: profile.crowdTolerance || 5,
        maximumWalkingDistance: profile.maximumWalkingDistance || 10,
        dietaryPreferences: profile.dietaryPreferences || '',
        accessibilityRequirements: profile.accessibilityRequirements || '',
        preferredWakeUpTime: profile.preferredWakeUpTime || '08:00:00',
        preferredSleepTime: profile.preferredSleepTime || '22:00:00'
      });
    }
  }, [profile]);

  const handleFieldChange = (field: keyof UserTravelProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (profile) {
        await updateProfileApi(formData);
        setSuccessMsg('Travel profile updated successfully!');
      } else {
        await createProfileApi(formData);
        setSuccessMsg('Travel profile created successfully!');
      }
      setIsEditing(false);
      refetch();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to save travel profile preferences.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ pb: 6 }}>
      <PageHeader
        title="Travel Profile"
        subtitle="Your personalized travel preferences used by TripTune recommendations"
      />

      {errorMsg && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{errorMsg}</Alert>}
      {successMsg && <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{successMsg}</Alert>}

      <Grid container spacing={3}>
        {/* User Identity Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <AppCard>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <PersonOutlineIcon sx={{ fontSize: 64, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                {user?.fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user?.email}
              </Typography>
              <Chip label={user?.role || 'USER'} size="small" color="primary" sx={{ mt: 1, fontWeight: 600 }} />
            </CardContent>
          </AppCard>

          {/* Travel Stats Analytics Card */}
          {!isEditing && (
            <AppCard sx={{ mt: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Travel Insights
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Completed Journeys
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      {pastTrips.length}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Total Days Traveled
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      {confirmedTrips.reduce((acc, t) => acc + (t.numberOfDays || 0), 0)} days
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Total Budget Invested
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'success.main' }}>
                      ₹{confirmedTrips.reduce((acc, t) => acc + (t.totalBudget || 0), 0)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Favorite Travel Season
                    </Typography>
                    {confirmedTrips.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">N/A</Typography>
                    ) : (
                      <Chip 
                        label={
                          Object.entries(
                            confirmedTrips.reduce((acc: Record<string, number>, t) => {
                              const season = t.selectedDestination?.bestSeason || 'All Year';
                              acc[season] = (acc[season] || 0) + 1;
                              return acc;
                            }, {})
                          ).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'All Year'
                        }
                        size="small"
                        color="secondary"
                        sx={{ fontWeight: 700 }}
                      />
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </AppCard>
          )}
        </Grid>

        {/* Travel Preferences Form / Display */}
        <Grid size={{ xs: 12, md: 8 }}>
          {isLoading && <LoadingSkeleton count={2} />}

          {/* Fallback error only if it's NOT an empty profile (e.g. real API offline) */}
          {isError && !isLoading && (
            <Alert severity="error" sx={{ mb: 3 }}>
              Unable to reach backend profile services. Please check your connection.
            </Alert>
          )}

          {!isLoading && !profile && !isEditing && (
            <AppCard>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                  No Travel Profile Created Yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Create your profile to help our Weka machine learning engine tailor recommendations exactly to your travel style, preferred pace, and interests.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<AddCircleOutlineIcon />}
                  onClick={() => setIsEditing(true)}
                >
                  Create Travel Profile
                </Button>
              </CardContent>
            </AppCard>
          )}

          {!isLoading && profile && !isEditing && (
            <Stack spacing={3}>
              <AppCard>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MoodOutlinedIcon color="primary" /> Preferred Moods
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      startIcon={<EditIcon />}
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </Button>
                  </Box>
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

                  <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
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
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    Travel Style & Limits
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 6, sm: 4 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Default Traveller Type</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{profile.defaultTravellerType || 'Not set'}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Preferred Travel Pace</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{profile.preferredTravelPace || 'Not set'}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Transport Preference</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{profile.preferredTransport || 'Not set'}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Crowd Tolerance</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{profile.crowdTolerance ? `${profile.crowdTolerance} / 10` : 'Not set'}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Max Travel Distance</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{profile.maximumTravelDistance ? `${profile.maximumTravelDistance} km` : 'Not set'}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 4 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Max Walking Distance</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{profile.maximumWalkingDistance ? `${profile.maximumWalkingDistance} km` : 'Not set'}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </AppCard>
            </Stack>
          )}

          {isEditing && (
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <AppCard>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Edit Travel Preferences</Typography>
                    
                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel id="moods-label">Preferred Moods</InputLabel>
                      <Select
                        labelId="moods-label"
                        multiple
                        value={formData.preferredMoods || []}
                        onChange={(e) => handleFieldChange('preferredMoods', e.target.value)}
                        input={<OutlinedInput label="Preferred Moods" />}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {(selected as string[]).map((value) => (
                              <Chip key={value} label={value.replace(/_/g, ' ')} size="small" />
                            ))}
                          </Box>
                        )}
                      >
                        {AVAILABLE_MOODS.map((mood) => (
                          <MenuItem key={mood} value={mood}>
                            {mood.replace(/_/g, ' ')}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>Select the moods you typically feel or search for during a trip</FormHelperText>
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel id="interests-label">Interests</InputLabel>
                      <Select
                        labelId="interests-label"
                        multiple
                        value={formData.interests || []}
                        onChange={(e) => handleFieldChange('interests', e.target.value)}
                        input={<OutlinedInput label="Interests" />}
                        renderValue={(selected) => (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {(selected as string[]).map((value) => (
                              <Chip key={value} label={value.replace(/_/g, ' ')} size="small" />
                            ))}
                          </Box>
                        )}
                      >
                        {AVAILABLE_INTERESTS.map((interest) => (
                          <MenuItem key={interest} value={interest}>
                            {interest.replace(/_/g, ' ')}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>Select topics/activities of interest</FormHelperText>
                    </FormControl>
                  </CardContent>
                </AppCard>

                <AppCard>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Travel Style & Constraints</Typography>
                    
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl fullWidth>
                          <InputLabel id="traveller-label">Default Traveller Type</InputLabel>
                          <Select
                            labelId="traveller-label"
                            value={formData.defaultTravellerType || 'SOLO'}
                            onChange={(e) => handleFieldChange('defaultTravellerType', e.target.value)}
                            label="Default Traveller Type"
                          >
                            {TRAVELLER_TYPES.map(type => (
                              <MenuItem key={type} value={type}>{type.replace(/_/g, ' ')}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl fullWidth>
                          <InputLabel id="pace-label">Preferred Travel Pace</InputLabel>
                          <Select
                            labelId="pace-label"
                            value={formData.preferredTravelPace || 'BALANCED'}
                            onChange={(e) => handleFieldChange('preferredTravelPace', e.target.value)}
                            label="Preferred Travel Pace"
                          >
                            {TRAVEL_PACES.map(pace => (
                              <MenuItem key={pace} value={pace}>{pace}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField 
                          fullWidth 
                          label="Preferred Transport" 
                          value={formData.preferredTransport || ''} 
                          onChange={(e) => handleFieldChange('preferredTransport', e.target.value)}
                          placeholder="e.g. Car, Train, Flight"
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField 
                          fullWidth 
                          type="number"
                          label="Crowd Tolerance (1 to 10)" 
                          value={formData.crowdTolerance || 5} 
                          onChange={(e) => handleFieldChange('crowdTolerance', Math.min(10, Math.max(1, Number(e.target.value))))}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField 
                          fullWidth 
                          type="number"
                          label="Max Travel Distance (km)" 
                          value={formData.maximumTravelDistance || 500} 
                          onChange={(e) => handleFieldChange('maximumTravelDistance', Number(e.target.value))}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField 
                          fullWidth 
                          type="number"
                          label="Max Walking Distance (km)" 
                          value={formData.maximumWalkingDistance || 10} 
                          onChange={(e) => handleFieldChange('maximumWalkingDistance', Number(e.target.value))}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </AppCard>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button 
                    variant="outlined" 
                    color="secondary" 
                    startIcon={<CancelIcon />}
                    onClick={() => setIsEditing(false)}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    variant="contained" 
                    color="primary" 
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Travel Profile'}
                  </Button>
                </Box>
              </Stack>
            </form>
          )}
        </Grid>
      </Grid>

      {/* Trip Lists Section */}
      {!isEditing && (
        <Grid container spacing={3} sx={{ mt: 3 }}>
          {/* Upcoming Trips Card */}
          <Grid size={{ xs: 12, md: 6 }}>
            <AppCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <FlightTakeoffIcon color="primary" /> Upcoming Trips
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {isLoadingTrips ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress size={30} />
                  </Box>
                ) : upcomingTrips.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                    No upcoming trips planned. Start planning your next trip!
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {upcomingTrips.map((trip) => (
                      <Box key={trip.tripId} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'action.hover' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {trip.tripName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {trip.selectedDestination ? `${trip.selectedDestination.name}, ${trip.selectedDestination.country}` : 'Destination TBD'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {trip.startDate} to {trip.endDate}
                            </Typography>
                          </Box>
                          <Button size="small" variant="outlined" onClick={() => navigate(`/trips/${trip.tripId}`)}>
                            View Details
                          </Button>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </AppCard>
          </Grid>

          {/* Past Trips Card */}
          <Grid size={{ xs: 12, md: 6 }}>
            <AppCard>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <HistoryIcon color="secondary" /> Travel History
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {isLoadingTrips ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress size={30} />
                  </Box>
                ) : pastTrips.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                    No travel history found. Completed trips will show up here.
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {pastTrips.map((trip) => (
                      <Box key={trip.tripId} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                              {trip.tripName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {trip.selectedDestination ? `${trip.selectedDestination.name}, ${trip.selectedDestination.country}` : 'Destination TBD'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {trip.startDate} to {trip.endDate}
                            </Typography>
                          </Box>
                          <Button size="small" variant="outlined" color="secondary" onClick={() => navigate(`/trips/${trip.tripId}`)}>
                            Review Plan
                          </Button>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </AppCard>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};
