import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Grid, Snackbar, Alert, Paper, MenuItem } from '@mui/material';
import { PageHeader } from '../components/common/PageHeader';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createTripApi } from '../api/trip';

const tripSchema = z.object({
  tripName: z.string().min(1, 'Trip name is required').max(150),
  startingLocation: z.string().min(1, 'Starting location is required').max(150),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  numberOfTravellers: z.number().min(1, 'At least 1 traveller required'),
  totalBudget: z.number().min(0, 'Budget cannot be negative'),
  travelPace: z.string().optional(),
  travellerType: z.string().optional()
});

type TripFormData = z.infer<typeof tripSchema>;

export const CreateTripPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      tripName: '',
      startingLocation: '',
      startDate: '',
      endDate: '',
      numberOfTravellers: 1,
      totalBudget: 0,
      travelPace: 'MODERATE',
      travellerType: 'SOLO'
    }
  });

  const onSubmit = async (data: TripFormData) => {
    try {
      setLoading(true);
      setError('');
      await createTripApi(data);
      setSuccess(true);
      setTimeout(() => navigate('/trips'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Plan a New Trip"
        subtitle="Configure your trip details, duration, budget, and travel preferences"
      />
      <Paper sx={{ p: 3, mt: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid size={{xs: 12, md: 6}} >
              <Controller
                name="tripName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Trip Name"
                    error={!!errors.tripName}
                    helperText={errors.tripName?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{xs: 12, md: 6}} >
              <Controller
                name="startingLocation"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Starting Location"
                    error={!!errors.startingLocation}
                    helperText={errors.startingLocation?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{xs: 12, md: 6}} >
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Start Date"
                    slotProps={{ inputLabel: { shrink: true } }}
                    error={!!errors.startDate}
                    helperText={errors.startDate?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{xs: 12, md: 6}} >
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="End Date"
                    slotProps={{ inputLabel: { shrink: true } }}
                    error={!!errors.endDate}
                    helperText={errors.endDate?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{xs: 12, md: 6}} >
              <Controller
                name="numberOfTravellers"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Number of Travellers"
                    onChange={e => field.onChange(parseInt(e.target.value))}
                    error={!!errors.numberOfTravellers}
                    helperText={errors.numberOfTravellers?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{xs: 12, md: 6}} >
              <Controller
                name="totalBudget"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Total Budget"
                    onChange={e => field.onChange(parseFloat(e.target.value))}
                    error={!!errors.totalBudget}
                    helperText={errors.totalBudget?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{xs: 12, md: 6}} >
              <Controller
                name="travellerType"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Traveller Type"
                  >
                    <MenuItem value="SOLO">Solo</MenuItem>
                    <MenuItem value="COUPLE">Couple</MenuItem>
                    <MenuItem value="FAMILY">Family</MenuItem>
                    <MenuItem value="FRIENDS">Friends</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{xs: 12, md: 6}} >
              <Controller
                name="travelPace"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    label="Travel Pace"
                  >
                    <MenuItem value="RELAXED">Relaxed</MenuItem>
                    <MenuItem value="MODERATE">Moderate</MenuItem>
                    <MenuItem value="FAST">Fast</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{xs: 12}}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Trip'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert severity="error" onClose={() => setError('')}>{error}</Alert>
      </Snackbar>
      <Snackbar open={success} autoHideDuration={6000} onClose={() => setSuccess(false)}>
        <Alert severity="success" onClose={() => setSuccess(false)}>Trip created successfully!</Alert>
      </Snackbar>
    </Box>
  );
};
