import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  Grid,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PageHeader } from '../components/common/PageHeader';
import { createTripApi, getTripApiErrorMessage } from '../api/trip';
import {
  BUDGET_FLEXIBILITY_OPTIONS,
  INTEREST_OPTIONS,
  MOOD_OPTIONS,
  TRAVEL_PACE_OPTIONS,
  TRAVELLER_TYPE_OPTIONS,
} from '../constants/tripEnums';
import type { TripCreateRequest } from '../types/trip';

const moodValues = MOOD_OPTIONS.map((option) => option.value);
const interestValues = INTEREST_OPTIONS.map((option) => option.value);
const travellerTypeValues = TRAVELLER_TYPE_OPTIONS.map((option) => option.value);
const travelPaceValues = TRAVEL_PACE_OPTIONS.map((option) => option.value);
const budgetFlexibilityValues = BUDGET_FLEXIBILITY_OPTIONS.map((option) => option.value);

const tripSchema = z
  .object({
    tripName: z.string().min(1, 'Trip name is required').max(150),
    startingLocation: z.string().min(1, 'Starting location is required').max(150),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    numberOfTravellers: z.number().min(1, 'At least 1 traveller is required'),
    travellerType: z.enum(travellerTypeValues, { message: 'Traveller type is required' }),
    perPersonBudget: z.number().gt(0, 'Per person budget must be greater than 0'),
    travelPace: z.enum(travelPaceValues, { message: 'Travel pace is required' }),
    moods: z.array(z.enum(moodValues)).min(1, 'Select at least one mood'),
    interests: z.array(z.enum(interestValues)).min(1, 'Select at least one interest'),
    numberOfAdults: z.number().min(0, 'Adults cannot be negative').optional(),
    numberOfChildren: z.number().min(0, 'Children cannot be negative').optional(),
    numberOfElderly: z.number().min(0, 'Elderly cannot be negative').optional(),
    preferredTransport: z.string().max(100).optional(),
    budgetFlexibility: z.enum(budgetFlexibilityValues).optional(),
    maximumTravelDistance: z.number().min(0, 'Maximum travel distance cannot be negative').optional(),
    crowdTolerance: z.number().min(1).max(10).optional(),
    maximumWalkingDistance: z.number().min(0, 'Maximum walking distance cannot be negative').optional(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'End date must not be before start date',
    path: ['endDate'],
  })
  .refine((data) => {
    const hasBreakdown =
      data.numberOfAdults !== undefined ||
      data.numberOfChildren !== undefined ||
      data.numberOfElderly !== undefined;
    if (!hasBreakdown) {
      return true;
    }
    const adults = data.numberOfAdults ?? 0;
    const children = data.numberOfChildren ?? 0;
    const elderly = data.numberOfElderly ?? 0;
    return adults + children + elderly === data.numberOfTravellers;
  }, {
    message: 'Adults, children, and elderly must total the number of travellers',
    path: ['numberOfAdults'],
  });

type TripFormData = z.infer<typeof tripSchema>;

const STEPS = ['Trip Details', 'Travel Preferences', 'Advanced Preferences (Optional)'];

const STEP_FIELDS: Record<number, (keyof TripFormData)[]> = {
  0: ['tripName', 'startingLocation', 'startDate', 'endDate', 'numberOfTravellers', 'travellerType', 'perPersonBudget'],
  1: ['travelPace', 'moods', 'interests'],
  2: [
    'preferredTransport',
    'budgetFlexibility',
    'maximumTravelDistance',
    'crowdTolerance',
    'maximumWalkingDistance',
    'numberOfAdults',
    'numberOfChildren',
    'numberOfElderly',
  ],
};

interface EnumMultiSelectProps<T extends string> {
  label: string;
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T[];
  onChange: (value: T[]) => void;
  error?: string;
}

function EnumMultiSelect<T extends string>({
  label,
  options,
  value,
  onChange,
  error,
}: EnumMultiSelectProps<T>) {
  const toggleValue = (optionValue: T) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((item) => item !== optionValue));
      return;
    }
    onChange([...value, optionValue]);
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        {label}
      </Typography>
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        {options.map((option) => {
          const selected = value.includes(option.value);
          return (
            <Chip
              key={option.value}
              label={option.label}
              clickable
              color={selected ? 'primary' : 'default'}
              variant={selected ? 'filled' : 'outlined'}
              onClick={() => toggleValue(option.value)}
              sx={{ mb: 1 }}
            />
          );
        })}
      </Stack>
      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}

function buildCreateTripPayload(data: TripFormData): TripCreateRequest {
  const payload: TripCreateRequest = {
    tripName: data.tripName,
    startingLocation: data.startingLocation,
    startDate: data.startDate,
    endDate: data.endDate,
    numberOfTravellers: data.numberOfTravellers,
    travellerType: data.travellerType,
    travelPace: data.travelPace,
    moods: data.moods,
    interests: data.interests,
    perPersonBudget: data.perPersonBudget,
  };

  if (data.numberOfAdults !== undefined) payload.numberOfAdults = data.numberOfAdults;
  if (data.numberOfChildren !== undefined) payload.numberOfChildren = data.numberOfChildren;
  if (data.numberOfElderly !== undefined) payload.numberOfElderly = data.numberOfElderly;
  if (data.preferredTransport?.trim()) payload.preferredTransport = data.preferredTransport.trim();
  if (data.budgetFlexibility) payload.budgetFlexibility = data.budgetFlexibility;
  if (data.maximumTravelDistance !== undefined) payload.maximumTravelDistance = data.maximumTravelDistance;
  if (data.crowdTolerance !== undefined) payload.crowdTolerance = data.crowdTolerance;
  if (data.maximumWalkingDistance !== undefined) payload.maximumWalkingDistance = data.maximumWalkingDistance;

  return payload;
}

export const CreateTripPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeStep, setActiveStep] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      tripName: '',
      startingLocation: '',
      startDate: '',
      endDate: '',
      numberOfTravellers: 1,
      travellerType: 'SOLO',
      perPersonBudget: 0,
      travelPace: 'BALANCED',
      moods: [],
      interests: [],
      preferredTransport: '',
    },
  });

  const goToNextStep = async () => {
    const valid = await trigger(STEP_FIELDS[activeStep]);
    if (valid) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const onSubmit = async (data: TripFormData) => {
    try {
      setLoading(true);
      setError('');
      const payload = buildCreateTripPayload(data);
      await createTripApi(payload);
      await queryClient.invalidateQueries({ queryKey: ['trips'] });
      setSuccess(true);
      setTimeout(() => navigate('/trips'), 1500);
    } catch (err: unknown) {
      setError(getTripApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    if (activeStep === 0) {
      return (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="tripName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Trip Name"
                  error={!!errors.tripName}
                  helperText={errors.tripName?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="startingLocation"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Starting Location"
                  error={!!errors.startingLocation}
                  helperText={errors.startingLocation?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="date"
                  label="Start Date"
                  slotProps={{ inputLabel: { shrink: true } }}
                  error={!!errors.startDate}
                  helperText={errors.startDate?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="date"
                  label="End Date"
                  slotProps={{ inputLabel: { shrink: true } }}
                  error={!!errors.endDate}
                  helperText={errors.endDate?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name="numberOfTravellers"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  label="Number of Travellers"
                  onChange={(event) => field.onChange(Number(event.target.value))}
                  error={!!errors.numberOfTravellers}
                  helperText={errors.numberOfTravellers?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name="travellerType"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Traveller Type"
                  error={!!errors.travellerType}
                  helperText={errors.travellerType?.message}
                >
                  {TRAVELLER_TYPE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name="perPersonBudget"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  label="Per Person Budget"
                  onChange={(event) => field.onChange(Number(event.target.value))}
                  error={!!errors.perPersonBudget}
                  helperText={errors.perPersonBudget?.message}
                />
              )}
            />
          </Grid>
        </Grid>
      );
    }

    if (activeStep === 1) {
      return (
        <Stack spacing={3}>
          <Controller
            name="travelPace"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Travel Pace"
                error={!!errors.travelPace}
                helperText={errors.travelPace?.message}
              >
                {TRAVEL_PACE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          <Controller
            name="moods"
            control={control}
            render={({ field }) => (
              <EnumMultiSelect
                label="Moods"
                options={MOOD_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                error={errors.moods?.message}
              />
            )}
          />
          <Controller
            name="interests"
            control={control}
            render={({ field }) => (
              <EnumMultiSelect
                label="Interests"
                options={INTEREST_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                error={errors.interests?.message}
              />
            )}
          />
        </Stack>
      );
    }

    return (
      <Stack spacing={3}>
        <Typography variant="body2" color="text.secondary">
          These preferences are optional. You can create your trip without filling them in.
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="preferredTransport"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Preferred Transport"
                  error={!!errors.preferredTransport}
                  helperText={errors.preferredTransport?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="budgetFlexibility"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Budget Flexibility"
                  value={field.value ?? ''}
                  onChange={(event) => field.onChange(event.target.value || undefined)}
                  error={!!errors.budgetFlexibility}
                  helperText={errors.budgetFlexibility?.message}
                >
                  <MenuItem value="">None</MenuItem>
                  {BUDGET_FLEXIBILITY_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="maximumTravelDistance"
              control={control}
              render={({ field }) => (
                <TextField
                  type="number"
                  label="Maximum Travel Distance (km)"
                  value={field.value ?? ''}
                  onChange={(event) =>
                    field.onChange(event.target.value === '' ? undefined : Number(event.target.value))
                  }
                  error={!!errors.maximumTravelDistance}
                  helperText={errors.maximumTravelDistance?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="crowdTolerance"
              control={control}
              render={({ field }) => (
                <TextField
                  type="number"
                  label="Crowd Tolerance (1-10)"
                  inputProps={{ min: 1, max: 10 }}
                  value={field.value ?? ''}
                  onChange={(event) =>
                    field.onChange(event.target.value === '' ? undefined : Number(event.target.value))
                  }
                  error={!!errors.crowdTolerance}
                  helperText={errors.crowdTolerance?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="maximumWalkingDistance"
              control={control}
              render={({ field }) => (
                <TextField
                  type="number"
                  label="Maximum Walking Distance (km)"
                  value={field.value ?? ''}
                  onChange={(event) =>
                    field.onChange(event.target.value === '' ? undefined : Number(event.target.value))
                  }
                  error={!!errors.maximumWalkingDistance}
                  helperText={errors.maximumWalkingDistance?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name="numberOfAdults"
              control={control}
              render={({ field }) => (
                <TextField
                  type="number"
                  label="Adults"
                  value={field.value ?? ''}
                  onChange={(event) =>
                    field.onChange(event.target.value === '' ? undefined : Number(event.target.value))
                  }
                  error={!!errors.numberOfAdults}
                  helperText={errors.numberOfAdults?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name="numberOfChildren"
              control={control}
              render={({ field }) => (
                <TextField
                  type="number"
                  label="Children"
                  value={field.value ?? ''}
                  onChange={(event) =>
                    field.onChange(event.target.value === '' ? undefined : Number(event.target.value))
                  }
                  error={!!errors.numberOfChildren}
                  helperText={errors.numberOfChildren?.message}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Controller
              name="numberOfElderly"
              control={control}
              render={({ field }) => (
                <TextField
                  type="number"
                  label="Elderly"
                  value={field.value ?? ''}
                  onChange={(event) =>
                    field.onChange(event.target.value === '' ? undefined : Number(event.target.value))
                  }
                  error={!!errors.numberOfElderly}
                  helperText={errors.numberOfElderly?.message}
                />
              )}
            />
          </Grid>
        </Grid>
      </Stack>
    );
  };

  return (
    <Box>
      <PageHeader
        title="Plan a New Trip"
        subtitle="Tell us the essentials so TripTune can recommend the right destinations"
      />

      <Paper sx={{ p: 3, mt: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={handleSubmit(onSubmit)}>
          {renderStepContent()}

          <Stack direction="row" spacing={2} sx={{ mt: 4 }} flexWrap="wrap" useFlexGap>
            {activeStep > 0 && (
              <Button variant="outlined" onClick={() => setActiveStep((prev) => prev - 1)} disabled={loading}>
                Back
              </Button>
            )}

            {activeStep === 0 && (
              <Button variant="contained" onClick={goToNextStep}>
                Next
              </Button>
            )}

            {activeStep === 1 && (
              <>
                <Button variant="contained" type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Trip'}
                </Button>
                <Button
                  variant="text"
                  onClick={() => {
                    setShowAdvanced(true);
                    setActiveStep(2);
                  }}
                >
                  Advanced Preferences (Optional)
                </Button>
              </>
            )}

            {activeStep === 2 && (
              <Button variant="contained" type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Trip'}
              </Button>
            )}
          </Stack>

          {activeStep === 1 && (
            <Collapse in={showAdvanced}>
              <Alert severity="info" sx={{ mt: 2 }}>
                Advanced preferences are optional. Use the button above if you want to fine-tune transport, budget
                flexibility, or traveller breakdown.
              </Alert>
            </Collapse>
          )}
        </form>
      </Paper>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
      <Snackbar open={success} autoHideDuration={6000} onClose={() => setSuccess(false)}>
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Trip created successfully
        </Alert>
      </Snackbar>
    </Box>
  );
};
