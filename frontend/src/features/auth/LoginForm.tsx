import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Box, Button, Alert, Link, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { FormTextField } from '../../components/common/FormTextField';
import { PasswordField } from '../../components/common/PasswordField';
import { useAuth } from '../../hooks/useAuth';
import { loginApi } from '../../api/auth';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setApiError(null);
    try {
      const response = await loginApi(data);
      if (response.success && response.data) {
        login(response.data);
        navigate('/dashboard', { replace: true });
      } else {
        setApiError(response.message || 'Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        setApiError(err.response.data.message);
      } else if (err.response?.status === 401) {
        setApiError('Invalid email or password.');
      } else {
        setApiError('Unable to connect to server. Please check if the backend is running.');
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
        label="Email Address"
        placeholder="you@example.com"
        autoComplete="email"
        {...register('email')}
        errorText={errors.email?.message}
      />

      <PasswordField
        label="Password"
        placeholder="••••••••"
        autoComplete="current-password"
        {...register('password')}
        errorText={errors.password?.message}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={isSubmitting}
        sx={{ mt: 1, mb: 3, py: 1.5, fontSize: '1rem' }}
      >
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </Button>

      <Typography variant="body2" align="center" color="text.secondary">
        Don't have a TripTune account?{' '}
        <Link
          component={RouterLink}
          to="/register"
          color="secondary.main"
          fontWeight={700}
          underline="hover"
        >
          Create one now
        </Link>
      </Typography>
    </Box>
  );
};
