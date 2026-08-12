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
  Grid,
  Tabs,
  Tab,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LuggageIcon from '@mui/icons-material/Luggage';
import PhotoIcon from '@mui/icons-material/PhotoLibraryOutlined';
import WalletIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import SendIcon from '@mui/icons-material/Send';

import { PageHeader } from '../components/common/PageHeader';
import { StatusChip } from '../components/common/StatusChip';
import { 
  getTripApi, 
  getItineraryApi, 
  rejectItineraryActivityApi, 
  confirmTripApi,
  inviteMemberApi,
  getMembersApi,
  uploadPhotoApi,
  getPhotosApi,
  addExpenseApi,
  getExpensesApi,
  getSplitsApi
} from '../api/trip';
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

  // Group Features State
  const [activeTab, setActiveTab] = useState(0);
  const [photos, setPhotos] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [splits, setSplits] = useState<any[]>([]);
  const [members, setMembers] = useState<string[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  
  // Upload Photo Dialog State
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoDay, setPhotoDay] = useState(1);
  const [photoActivity, setPhotoActivity] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Log Expense Dialog State
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDescription, setExpenseDescription] = useState('');

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

  const fetchPhotos = async () => {
    if (!tripId) return;
    try {
      const res = await getPhotosApi(Number(tripId));
      setPhotos(res.data);
    } catch (err) {
      console.error('Failed to load photos:', err);
    }
  };

  const fetchExpensesAndSplits = async () => {
    if (!tripId) return;
    try {
      const resExp = await getExpensesApi(Number(tripId));
      setExpenses(resExp.data);
      const resSplits = await getSplitsApi(Number(tripId));
      setSplits(resSplits.data);
    } catch (err) {
      console.error('Failed to load expenses/splits:', err);
    }
  };

  const fetchMembers = async () => {
    if (!tripId) return;
    try {
      const res = await getMembersApi(Number(tripId));
      setMembers(res.data);
    } catch (err) {
      console.error('Failed to load members:', err);
    }
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
          
          fetchPhotos();
          fetchExpensesAndSplits();
          fetchMembers();
        }
      } catch (err) {
        setError('Failed to fetch trip details');
      } finally {
        setLoading(false);
      }
    };
    fetchTripAndItinerary();
  }, [tripId]);

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripId || !inviteEmail.trim()) return;
    try {
      await inviteMemberApi(Number(tripId), inviteEmail.trim());
      setInviteEmail('');
      setSuccessMsg('Friend invited successfully!');
      fetchMembers();
      fetchExpensesAndSplits();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to invite member. Make sure they are registered.');
    }
  };

  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    console.log("Submitting photo upload...", { tripId, hasUrl: !!photoUrl, photoActivity });

    if (!tripId) {
      setError('Trip ID is missing.');
      return;
    }
    if (!photoUrl || !photoUrl.trim()) {
      setError('Please select a local image file or paste a photo URL.');
      return;
    }
    if (!photoActivity || !photoActivity.trim()) {
      setError('Please select a place or activity from the dropdown.');
      return;
    }

    try {
      await uploadPhotoApi(Number(tripId), {
        imageUrl: photoUrl.trim(),
        caption: photoCaption.trim(),
        dayNumber: photoDay,
        activityName: photoActivity.trim()
      });
      setPhotoUrl('');
      setPhotoCaption('');
      setPhotoDialogOpen(false);
      setSuccessMsg('Photo shared successfully!');
      fetchPhotos();
    } catch (err: any) {
      console.error("Photo upload failed:", err);
      setError(err.response?.data?.message || 'Failed to upload photo.');
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripId || !expenseAmount.trim() || !expenseDescription.trim()) return;
    try {
      await addExpenseApi(Number(tripId), {
        amount: Number(expenseAmount.trim()),
        description: expenseDescription.trim()
      });
      setExpenseAmount('');
      setExpenseDescription('');
      setExpenseDialogOpen(false);
      setSuccessMsg('Expense logged successfully!');
      fetchExpensesAndSplits();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to log expense.');
    }
  };

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
          <Chip label={`Budget: ₹${tripBudget}`} variant="outlined" />
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
        <>
          <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Left Column: Itinerary & Packing */}
          <Grid size={{ xs: 12, lg: 7 }}>
            <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }} variant="outlined">
              <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>🗓️ Travel Itinerary</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Est. Cost: <strong>₹{estimatedCost}</strong>
                  </Typography>
                  {itineraryLoading && <CircularProgress size={20} />}
                </Box>
              </Box>

              {/* Budget Allocation Summary Card */}
              <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: 'action.hover' }}>
                <Grid container spacing={2} sx={{ alignItems: 'center' }}>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Trip Budget</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      ₹{tripBudget}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Estimated Cost</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: isOverBudget ? 'error.main' : 'success.main' }}>
                      ₹{estimatedCost}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Status</Typography>
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
                    <Typography sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: '0.95rem' }}>
                      Day {day.dayNumber} — {day.date}
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
                                  <Box sx={{ mb: 0.5 }}>
                                    <Chip
                                      label={`${activity.timeSlot.toUpperCase()} • ${activity.startTime}`}
                                      size="small"
                                      sx={{ 
                                        fontWeight: 700, 
                                        fontSize: '0.65rem', 
                                        height: 18, 
                                        backgroundColor: isConfirmed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(15, 44, 89, 0.08)',
                                        color: isConfirmed ? 'success.main' : 'primary.main',
                                        border: 'none'
                                      }}
                                    />
                                  </Box>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                                    {activity.name}
                                  </Typography>
                                  {activity.description && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1, fontSize: '0.85rem' }}>
                                      {activity.description}
                                    </Typography>
                                  )}
                                  <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1.5, mt: 1, flexWrap: 'wrap' }}>
                                    <Chip label={activity.category} size="small" sx={{ height: 20, fontSize: '0.75rem' }} />
                                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.5, alignItems: 'center', color: 'text.secondary' }}>
                                      <AccessTimeIcon fontSize="inherit" style={{ fontSize: '0.8rem' }} />
                                      <Typography variant="caption" style={{ fontSize: '0.75rem' }}>{activity.durationMinutes} mins</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.5, alignItems: 'center', color: 'text.secondary' }}>
                                      <AttachMoneyIcon fontSize="inherit" style={{ fontSize: '0.8rem' }} />
                                      <Typography variant="caption" style={{ fontSize: '0.75rem' }}>₹{activity.estimatedCost}/person</Typography>
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
                                        <DeleteIcon fontSize="small" />
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
                      <Typography variant="body2" color="text.secondary">No activities scheduled.</Typography>
                    )}
                  </AccordionDetails>
                </Accordion>
              ))}

              {!isConfirmed && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Button 
                    variant="contained" 
                    color="success" 
                    onClick={handleConfirmTrip}
                    disabled={confirming}
                    sx={{ fontWeight: 'bold', px: 4, py: 1.2, borderRadius: 2 }}
                  >
                    {confirming ? 'Confirming Itinerary...' : 'Confirm Itinerary & Finalize Plan'}
                  </Button>
                </Box>
              )}
            </Paper>

            {/* Packing List */}
            {packingList.length > 0 && (
              <Paper sx={{ p: 3, borderRadius: 3 }} variant="outlined">
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  🎒 Packing Assistant
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.85rem' }}>
                  Suggested items for {trip.selectedDestination.name}'s weather.
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}>Progress</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.85rem', color: packingList.filter(item => item.checked).length === packingList.length ? 'success.main' : 'primary.main' }}>
                      {packingList.filter(item => item.checked).length} / {packingList.length} packed
                    </Typography>
                  </Box>
                  <Box sx={{ width: '100%', height: 6, bgcolor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
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

                <Grid container spacing={2}>
                  {(['Clothing', 'Documents', 'Gear', 'Toiletries'] as const).map((category) => {
                    const categoryItems = packingList.filter((item) => item.category === category);
                    if (categoryItems.length === 0) return null;
                    return (
                      <Grid size={{ xs: 12, sm: 6 }} key={category}>
                        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, textTransform: 'capitalize', fontSize: '0.85rem' }}>
                            {category}
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {categoryItems.map((item) => (
                              <Box
                                key={item.name}
                                onClick={() => handleTogglePackingItem(item.name)}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  cursor: 'pointer',
                                  p: 0.25,
                                  borderRadius: 0.5,
                                  '&:hover': { bgcolor: 'action.selected' },
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 16,
                                    height: 16,
                                    borderRadius: '3px',
                                    border: '1.5px solid',
                                    borderColor: item.checked ? 'success.main' : 'text.disabled',
                                    bgcolor: item.checked ? 'success.main' : 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  {item.checked && (
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                  )}
                                </Box>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    textDecoration: item.checked ? 'line-through' : 'none',
                                    color: item.checked ? 'text.disabled' : 'text.primary',
                                    fontSize: '0.8rem',
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
          </Grid>

          {/* Right Column: Group Photos & Expenses */}
          <Grid size={{ xs: 12, lg: 5 }}>
            {/* Collaborators Panel */}
            <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }} variant="outlined">
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                👥 Trip Collaborators
              </Typography>
              <form onSubmit={handleInviteMember}>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <TextField
                    size="small"
                    label="Invite Friend by Email"
                    variant="outlined"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    fullWidth
                  />
                  <IconButton color="primary" type="submit" sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}>
                    <SendIcon style={{ fontSize: '1.2rem' }} />
                  </IconButton>
                </Stack>
              </form>

              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mt: 1 }}>
                <Chip
                  label={`${trip.createdBy?.fullName || 'Creator'} (Owner)`}
                  size="small"
                  color="primary"
                  sx={{ fontWeight: 'bold' }}
                />
                {members.filter(m => m !== trip.createdBy?.email).map((mEmail, idx) => (
                  <Chip
                    key={idx}
                    label={mEmail}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Paper>

            {/* Budget Splits & Ledger Panel */}
            <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }} variant="outlined">
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                  💰 Expense Ledger & Splits
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => setExpenseDialogOpen(true)}
                >
                  Log Expense
                </Button>
              </Box>

              <Grid container spacing={2}>
                {/* Ledger Log */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, fontSize: '0.85rem' }}>Ledger Logs</Typography>
                  {expenses.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, fontSize: '0.8rem' }}>No expenses.</Typography>
                  ) : (
                    <Stack spacing={1} sx={{ maxHeight: 220, overflowY: 'auto', pr: 0.5 }}>
                      {expenses.map((e) => (
                        <Box key={e.id} sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1.5, bgcolor: 'action.hover' }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>{e.description}</Typography>
                          <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>
                            ₹{e.amount}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" style={{ fontSize: '0.7rem' }}>
                            By: {e.paidBy?.fullName?.split(' ')[0] || e.paidBy?.email?.split('@')[0]}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Grid>

                {/* Split Settlements */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, fontSize: '0.85rem' }}>Settlements</Typography>
                  {expenses.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, fontSize: '0.8rem' }}>No logs yet.</Typography>
                  ) : splits.length === 0 ? (
                    <Alert severity="success" icon={false} sx={{ p: 0.5, fontSize: '0.8rem', borderRadius: 1.5 }}>All settled!</Alert>
                  ) : (
                    <Stack spacing={1} sx={{ maxHeight: 220, overflowY: 'auto', pr: 0.5 }}>
                      {splits.map((s, idx) => (
                        <Box key={idx} sx={{ p: 1, border: '1px solid', borderColor: 'info.main', borderRadius: 1.5, bgcolor: 'rgba(2, 136, 209, 0.02)' }}>
                          <Typography variant="body2" style={{ fontSize: '0.75rem' }}>
                            <strong>{s.fromUserName?.split(' ')[0]}</strong> owes <strong>{s.toUserName?.split(' ')[0]}</strong>
                          </Typography>
                          <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 'bold' }}>
                            ₹{s.amount}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Grid>
              </Grid>
            </Paper>

            {/* Shared Photo Gallery Panel */}
            <Paper sx={{ p: 3, borderRadius: 3 }} variant="outlined">
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                  📸 Shared Travel Gallery
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => {
                    setPhotoDay(1);
                    if (itinerary.days && itinerary.days[0] && itinerary.days[0].activities && itinerary.days[0].activities[0]) {
                      setPhotoActivity(itinerary.days[0].activities[0].name);
                    } else {
                      setPhotoActivity('Hotel/Stay');
                    }
                    setPhotoDialogOpen(true);
                  }}
                >
                  Share Photo
                </Button>
              </Box>

              {photos.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center', fontSize: '0.85rem' }}>
                  No photos shared yet.
                </Typography>
              ) : (
                <Grid container spacing={1.5} sx={{ maxHeight: 350, overflowY: 'auto', pr: 0.5 }}>
                  {photos.map((p) => (
                    <Grid size={{ xs: 6, sm: 4 }} key={p.id}>
                      <Card variant="outlined" sx={{ borderRadius: 1.5, overflow: 'hidden', height: 100, position: 'relative' }}>
                        <img 
                          src={p.imageUrl} 
                          alt={p.caption || p.activityName} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=100&q=80';
                          }}
                        />
                        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', px: 0.5, py: 0.25, textAlign: 'center' }}>
                          <Typography variant="caption" sx={{ fontSize: '0.55rem', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {p.activityName}
                          </Typography>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </Grid>
        </Grid>

      {/* Photo Upload Dialog */}
      <Dialog open={photoDialogOpen} onClose={() => setPhotoDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Share a Photo Memory</DialogTitle>
        <form onSubmit={handleUploadPhoto}>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Photo URL (or choose a file below)"
                variant="outlined"
                value={photoUrl.startsWith('data:image') ? 'Local File Selected' : photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://example.com/sunset.jpg"
                required={!photoUrl}
                fullWidth
              />

              <Button
                variant="outlined"
                color="primary"
                fullWidth
                type="button"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose Local Image File
              </Button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      if (typeof reader.result === 'string') {
                        setPhotoUrl(reader.result);
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />

              {photoUrl && photoUrl.startsWith('data:image') && (
                <Box sx={{ mt: 1, textAlign: 'center' }}>
                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
                    ✓ Image Loaded Successfully
                  </Typography>
                  <img 
                    src={photoUrl} 
                    alt="Preview" 
                    style={{ maxWidth: '100%', maxHeight: 120, objectFit: 'contain', borderRadius: 8, border: '1px solid #ddd' }} 
                  />
                </Box>
              )}
              <TextField
                label="Caption"
                variant="outlined"
                value={photoCaption}
                onChange={(e) => setPhotoCaption(e.target.value)}
                placeholder="Memorable views..."
                fullWidth
              />
              
              <FormControl fullWidth>
                <InputLabel id="photo-day-label">Itinerary Day</InputLabel>
                <Select
                  labelId="photo-day-label"
                  value={photoDay}
                  label="Itinerary Day"
                  onChange={(e) => {
                    const dayNum = Number(e.target.value);
                    setPhotoDay(dayNum);
                    const dayInfo = itinerary.days?.find(d => d.dayNumber === dayNum);
                    if (dayInfo && dayInfo.activities && dayInfo.activities[0]) {
                      setPhotoActivity(dayInfo.activities[0].name);
                    }
                  }}
                >
                  {itinerary.days?.map(d => (
                    <MenuItem key={d.dayNumber} value={d.dayNumber}>Day {d.dayNumber} ({d.date})</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="photo-activity-label">Place/Activity</InputLabel>
                <Select
                  labelId="photo-activity-label"
                  value={photoActivity}
                  label="Place/Activity"
                  onChange={(e) => setPhotoActivity(e.target.value)}
                >
                  {itinerary.days?.find(d => d.dayNumber === photoDay)?.activities?.map((a, idx) => (
                    <MenuItem key={idx} value={a.name}>{a.name}</MenuItem>
                  ))}
                  <MenuItem value="Hotel/Stay">Hotel / Stay</MenuItem>
                  <MenuItem value="Transit/Travel">Transit / Travel</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={() => setPhotoDialogOpen(false)} color="secondary" type="button">Cancel</Button>
            <Button type="submit" variant="contained" color="primary">Share Photo</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Log Expense Dialog */}
      <Dialog open={expenseDialogOpen} onClose={() => setExpenseDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Log Group Expense</DialogTitle>
        <form onSubmit={handleAddExpense}>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Amount (₹)"
                type="number"
                variant="outlined"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                placeholder="e.g. 50"
                required
                fullWidth
              />
              <TextField
                label="Description"
                variant="outlined"
                value={expenseDescription}
                onChange={(e) => setExpenseDescription(e.target.value)}
                placeholder="e.g. Taxi fare, Dinner, Drinks"
                required
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={() => setExpenseDialogOpen(false)} color="secondary" type="button">Cancel</Button>
            <Button type="submit" variant="contained" color="primary">Log Expense</Button>
          </DialogActions>
        </form>
      </Dialog>
      </>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
    </Box>
  );
};
