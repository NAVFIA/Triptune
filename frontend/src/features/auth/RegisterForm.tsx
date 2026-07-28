import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Button, Alert, Link, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { FormTextField } from '../../components/common/FormTextField';
import { PasswordField } from '../../components/common/PasswordField';
import { useAuth } from '../../hooks/useAuth';
import { registerApi } from '../../api/auth';

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
    phoneNumber: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setApiError(null);
    try {
      const payload = {
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        phoneNumber: data.phoneNumber || undefined,
      };
      const response = await registerApi(payload);
      if (response.success && response.data) {
        login(response.data);
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/login');
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        setApiError(err.response.data.message);
      } else {
        setApiError('Registration failed. Please try again.');
      }
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ width: '100%' }}>
      {apiError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {apiError}
        </Alert>
      )}

      <FormTextField
        label="Full Name"
        placeholder="Jane Doe"
        autoComplete="name"
        {...register('fullName')}
        errorText={errors.fullName?.message}
      />

      <FormTextField
        label="Email Address"
        placeholder="you@example.com"
        autoComplete="email"
        {...register('email')}
        errorText={errors.email?.message}
      />

      <FormTextField
        label="Phone Number (Optional)"
        placeholder="+1 555-0199"
        autoComplete="tel"
        {...register('phoneNumber')}
        errorText={errors.phoneNumber?.message}
      />

      <PasswordField
        label="Password"
        placeholder="At least 8 characters"
        autoComplete="new-password"
        {...register('password')}
        errorText={errors.password?.message}
      />

      <PasswordField
        label="Confirm Password"
        placeholder="Repeat your password"
        autoComplete="new-password"
        {...register('confirmPassword')}
        errorText={errors.confirmPassword?.message}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={isSubmitting}
        sx={{ mt: 1, mb: 3, py: 1.5, fontSize: '1rem' }}
      >
        {isSubmitting ? 'Creating account...' : 'Create Account'}
      </Button>

      <Typography variant="body2" align="center" color="text.secondary">
        Already have a TripTune account?{' '}
        <Link
          component={RouterLink}
          to="/login"
          color="secondary.main"
          sx={{ fontWeight: 700 }}
          underline="hover"
        >
          Sign in
        </Link>
      </Typography>
    </Box>
  );
};
