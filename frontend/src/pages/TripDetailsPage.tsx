import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  CircularProgress, 
  Chip, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails, 
  IconButton, 
  Tooltip, 
  Card, 
  CardContent, 
  Stack,
  Alert,
  Grid
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { PageHeader } from '../components/common/PageHeader';
import { StatusChip } from '../components/common/StatusChip';
import { getTripApi, getItineraryApi, rejectItineraryActivityApi, confirmTripApi } from '../api/trip';
import type { Trip, Itinerary } from '../types/trip';

interface PackingItem {
  name: string;
  category: 'Clothing' | 'Documents' | 'Gear' | 'Toiletries';
  checked: boolean;
}

const generatePackingList = (season: string, duration: number, travellerType: string): PackingItem[] => {
  const list: PackingItem[] = [
    { name: 'Passport / Government ID', category: 'Documents', checked: false },
    { name: 'Trip Itinerary & Booking Details', category: 'Documents', checked: false },
    { name: 'Travel Insurance Documents', category: 'Documents', checked: false },
    { name: 'Toothbrush & Toothpaste', category: 'Toiletries', checked: false },
    { name: 'Shampoo & Conditioner', category: 'Toiletries', checked: false },
    { name: 'Deodorant', category: 'Toiletries', checked: false },
    { name: 'First Aid Kit & Personal Meds', category: 'Toiletries', checked: false },
    { name: 'Phone Charger & Adapter', category: 'Gear', checked: false },
  ];

  const clothingCount = Math.max(3, Math.min(10, duration));
  list.push({ name: `${clothingCount}x Pairs of Socks`, category: 'Clothing', checked: false });
  list.push({ name: `${clothingCount}x Sets of Underwear`, category: 'Clothing', checked: false });
  list.push({ name: 'Comfortable Walking Shoes', category: 'Clothing', checked: false });

  const cleanSeason = (season || 'all').toLowerCase();
  if (cleanSeason.includes('summer')) {
    list.push({ name: 'Sunscreen (SPF 50+)', category: 'Toiletries', checked: false });
    list.push({ name: 'Sunglasses & Sun Hat', category: 'Clothing', checked: false });
    list.push({ name: 'Swimwear', category: 'Clothing', checked: false });
    list.push({ name: 'Light T-shirts & Shorts', category: 'Clothing', checked: false });
  } else if (cleanSeason.includes('winter')) {
    list.push({ name: 'Heavy Coat / Parka', category: 'Clothing', checked: false });
    list.push({ name: 'Thermal Base Layers', category: 'Clothing', checked: false });
    list.push({ name: 'Beanie, Gloves & Scarf', category: 'Clothing', checked: false });
    list.push({ name: 'Lip Balm & Moisturizer', category: 'Toiletries', checked: false });
    list.push({ name: 'Pocket Hand Warmers', category: 'Gear', checked: false });
  } else if (cleanSeason.includes('spring') || cleanSeason.includes('autumn')) {
    list.push({ name: 'Windbreaker / Light Jacket', category: 'Clothing', checked: false });
    list.push({ name: 'Umbrella / Raincoat', category: 'Gear', checked: false });
    list.push({ name: 'Layered Outfits (variable weather)', category: 'Clothing', checked: false });
  }

  const cleanType = (travellerType || 'solo').toLowerCase();
  if (cleanType.includes('family') || cleanType.includes('children')) {
    list.push({ name: 'Kids Entertainment / Toys', category: 'Gear', checked: false });
    list.push({ name: 'Family Snacks & Wet Wipes', category: 'Toiletries', checked: false });
  } else if (cleanType.includes('couple') || cleanType.includes('romantic')) {
    list.push({ name: 'Nice Dinner Outfit', category: 'Clothing', checked: false });
  }

  return list;
};

export const TripDetailsPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [itineraryLoading, setItineraryLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');
  const [packingList, setPackingList] = useState<PackingItem[]>([]);

  useEffect(() => {
    if (!trip) return;
    const cacheKey = `triptune_packing_${tripId}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      setPackingList(JSON.parse(cached));
    } else {
      const generated = generatePackingList(
        trip.selectedDestination?.bestSeason || '',
        trip.numberOfDays || 3,
        trip.travellerType || ''
      );
      setPackingList(generated);
      localStorage.setItem(cacheKey, JSON.stringify(generated));
    }
  }, [trip, tripId]);

  const handleTogglePackingItem = (itemName: string) => {
    setPackingList((prev) => {
      const updated = prev.map((item) =>
        item.name === itemName ? { ...item, checked: !item.checked } : item
      );
      localStorage.setItem(`triptune_packing_${tripId}`, JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    if (!tripId) return;
    const fetchTripAndItinerary = async () => {
      try {
        const tripData = await getTripApi(Number(tripId));
        setTrip(tripData.data);
        
        if (tripData.data.selectedDestination) {
          const itineraryData = await getItineraryApi(Number(tripId));
          setItinerary(itineraryData.data);
        }
      } catch (err) {
        setError('Failed to fetch trip details');
      } finally {
        setLoading(false);
      }
    };
    fetchTripAndItinerary();
  }, [tripId]);

  const handleReplaceActivity = async (activityId: number) => {
    if (!tripId) return;
    setItineraryLoading(true);
    try {
      const updated = await rejectItineraryActivityApi(Number(tripId), activityId);
      setItinerary(updated.data);
    } catch (err) {
      console.error('Failed to replace activity:', err);
      setError('Could not replace activity. Please try again.');
    } finally {
      setItineraryLoading(false);
    }
  };

  const handleConfirmTrip = async () => {
    if (!tripId) return;
    setConfirming(true);
    setError('');
    try {
      const result = await confirmTripApi(Number(tripId));
      setTrip(result.data);
      setSuccessMsg('Congratulations! Your travel itinerary has been confirmed and finalized.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Failed to confirm trip:', err);
      setError('Failed to confirm and finalize trip.');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (!trip) return <Typography color="error" sx={{ mt: 4 }}>Trip not found</Typography>;

  const isConfirmed = trip?.status === 'CONFIRMED';
  const tripBudget = trip?.totalBudget ? Number(trip.totalBudget) : 0;
  const estimatedCost = itinerary?.totalEstimatedCost ? Number(itinerary.totalEstimatedCost) : 0;
  const isOverBudget = estimatedCost > tripBudget;

  return (
    <Box sx={{ pb: 6 }}>
      {successMsg && (
        <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccessMsg('')}>
          {successMsg}
        </Alert>
      )}

      <PageHeader
        title={trip.tripName}
        subtitle={`${trip.startDate} to ${trip.endDate}`}
        action={
          !trip.selectedDestination ? (
            <Button variant="contained" color="primary" onClick={() => navigate(`/trips/${tripId}/destinations`)}>
              Get Destination Recommendations
            </Button>
          ) : isConfirmed ? (
            <Chip 
              icon={<CheckCircleIcon style={{ color: '#2e7d32' }} />} 
              label="Finalized & Confirmed" 
              sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 'bold', p: 1 }} 
            />
          ) : (
            <Button 
              variant="contained" 
              color="success" 
              onClick={handleConfirmTrip}
              disabled={confirming}
              sx={{ fontWeight: 'bold' }}
            >
              {confirming ? 'Finalizing...' : 'Confirm Itinerary & Finalize Plan'}
            </Button>
          )
        }
      />
      
      <Paper sx={{ p: 3, mt: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>Trip Overview</Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          <StatusChip status={trip.status} />
          <Chip label={`Pace: ${trip.travelPace || 'Balanced'}`} variant="outlined" />
          <Chip label={`Budget: $${tripBudget}`} variant="outlined" />
          <Chip label={`Travellers: ${trip.numberOfTravellers}`} variant="outlined" />
        </Stack>
        <Typography variant="body2" color="text.secondary">
          <strong>Starting From:</strong> {trip.startingLocation} | <strong>Traveller Profile:</strong> {trip.travellerType || 'Solo'}
        </Typography>

        {trip.selectedDestination && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Selected Destination</Typography>
            <Typography variant="body1">
              <strong>{trip.selectedDestination.name}</strong>, {trip.selectedDestination.country}
            </Typography>
            {trip.selectedDestination.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {trip.selectedDestination.description}
              </Typography>
            )}
          </Box>
        )}
      </Paper>

      {trip && trip.selectedDestination && itinerary && (
        <Box sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Your Personal Itinerary</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Total Est. Cost: <strong>${estimatedCost}</strong>
              </Typography>
              {itineraryLoading && <CircularProgress size={20} />}
            </Box>
          </Box>

          {/* Budget Allocation Summary Card */}
          <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: 'action.hover' }}>
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Trip Budget</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  ${tripBudget}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Estimated Cost</Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: isOverBudget ? 'error.main' : 'success.main' }}>
                  ${estimatedCost}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Budget Status</Typography>
                {isOverBudget ? (
                  <Chip label="Over Budget" color="error" size="small" sx={{ fontWeight: 'bold' }} />
                ) : (
                  <Chip label="Within Budget" color="success" size="small" sx={{ fontWeight: 'bold' }} />
                )}
              </Grid>
            </Grid>
          </Paper>

          {itinerary.days && itinerary.days.map((day) => (
            <Accordion key={day.dayNumber} defaultExpanded={day.dayNumber === 1} sx={{ mb: 2, borderRadius: '12px !important', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #E2E8F0' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', py: 1 }}>
                <Typography sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: '1rem' }}>
                  🗓️ Day {day.dayNumber} — {day.date}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 2 }}>
                {day.activities && day.activities.length > 0 ? (
                  <Stack spacing={2}>
                    {day.activities.map((activity, idx) => (
                      <Card key={activity.id || idx} variant="outlined" sx={{ position: 'relative', borderLeft: '4px solid', borderLeftColor: isConfirmed ? 'success.main' : 'primary.main' }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                          <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                              <Box sx={{ mb: 1 }}>
                                <Chip
                                  label={`${activity.timeSlot.toUpperCase()} SLOT • ${activity.startTime}`}
                                  size="small"
                                  sx={{ 
                                    fontWeight: 700, 
                                    fontSize: '0.65rem', 
                                    height: 20, 
                                    backgroundColor: isConfirmed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(15, 44, 89, 0.08)',
                                    color: isConfirmed ? 'success.main' : 'primary.main',
                                    border: 'none'
                                  }}
                                />
                              </Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                {activity.name}
                              </Typography>
                              {activity.description && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1 }}>
                                  {activity.description}
                                </Typography>
                              )}
                              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, mt: 1 }}>
                                <Chip label={activity.category} size="small" />
                                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.5, alignItems: 'center', color: 'text.secondary' }}>
                                  <AccessTimeIcon fontSize="inherit" />
                                  <Typography variant="caption">{activity.durationMinutes} mins</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.5, alignItems: 'center', color: 'text.secondary' }}>
                                  <AttachMoneyIcon fontSize="inherit" />
                                  <Typography variant="caption">${activity.estimatedCost}/person</Typography>
                                </Box>
                              </Box>
                            </Box>
                            
                            {!isConfirmed && (
                              <Tooltip title="Replace Activity">
                                <span>
                                  <IconButton 
                                    color="error" 
                                    onClick={() => handleReplaceActivity(activity.id)}
                                    disabled={itineraryLoading}
                                    size="small"
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">No activities scheduled for this day.</Typography>
                )}
              </AccordionDetails>
            </Accordion>
          ))}

          {!isConfirmed && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button 
                variant="contained" 
                color="success" 
                size="large"
                onClick={handleConfirmTrip}
                disabled={confirming}
                sx={{ fontWeight: 'bold', px: 6, py: 1.5, borderRadius: 3 }}
              >
                {confirming ? 'Confirming Trip...' : 'Confirm Itinerary & Finalize Plan'}
              </Button>
            </Box>
          )}
          {/* Packing Assistant section */}
          {trip && trip.selectedDestination && packingList.length > 0 && (
            <Paper sx={{ p: 3, mt: 4, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                🎒 Packing Assistant
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Suggested items to bring for {trip.selectedDestination.name}'s {trip.selectedDestination.bestSeason} weather.
              </Typography>

              {/* Packing Progress */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Packing Progress
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: packingList.filter(item => item.checked).length === packingList.length ? 'success.main' : 'primary.main' }}>
                    {packingList.filter(item => item.checked).length} of {packingList.length} items packed ({packingList.length > 0 ? Math.round((packingList.filter(item => item.checked).length / packingList.length) * 100) : 0}%)
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: '100%',
                    height: 8,
                    bgcolor: 'divider',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      width: `${packingList.length > 0 ? Math.round((packingList.filter(item => item.checked).length / packingList.length) * 100) : 0}%`,
                      height: '100%',
                      bgcolor: packingList.filter(item => item.checked).length === packingList.length ? 'success.main' : 'primary.main',
                      transition: 'width 0.3s ease-out',
                    }}
                  />
                </Box>
              </Box>

              {/* Categories Grid */}
              <Grid container spacing={3}>
                {(['Clothing', 'Documents', 'Gear', 'Toiletries'] as const).map((category) => {
                  const categoryItems = packingList.filter((item) => item.category === category);
                  if (categoryItems.length === 0) return null;
                  return (
                    <Grid size={{ xs: 12, sm: 6 }} key={category}>
                      <Paper variant="outlined" sx={{ p: 2, height: '100%', borderRadius: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1.5, textTransform: 'capitalize' }}>
                          {category}
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {categoryItems.map((item) => (
                            <Box
                              key={item.name}
                              onClick={() => handleTogglePackingItem(item.name)}
                              sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 1,
                                cursor: 'pointer',
                                userSelect: 'none',
                                p: 0.5,
                                borderRadius: 1,
                                '&:hover': { bgcolor: 'action.hover' },
                              }}
                            >
                              <Box
                                sx={{
                                  width: 20,
                                  height: 20,
                                  borderRadius: '4px',
                                  border: '2px solid',
                                  borderColor: item.checked ? 'success.main' : 'text.disabled',
                                  bgcolor: item.checked ? 'success.main' : 'transparent',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.15s',
                                }}
                              >
                                {item.checked && (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                  </svg>
                                )}
                              </Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  textDecoration: item.checked ? 'line-through' : 'none',
                                  color: item.checked ? 'text.disabled' : 'text.primary',
                                }}
                              >
                                {item.name}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Paper>
          )}
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
    </Box>
  );
};
