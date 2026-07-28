import React from 'react';
import { Box, Card, Container, Grid, Typography, Avatar } from '@mui/material';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { RegisterForm } from '../features/auth/RegisterForm';

export const RegisterPage: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        py: { xs: 4, md: 8 },
        px: 2,
      }}
    >
      <Container maxWidth="lg">
        <Card
          elevation={0}
          sx={{
            borderRadius: { xs: 4, md: 6 },
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.08)',
          }}
        >
          <Grid container>
            {/* Left Visual Panel */}
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                backgroundColor: 'primary.main',
                color: '#FFFFFF',
                p: { xs: 4, md: 6 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                backgroundImage: 'linear-gradient(135deg, #0F2C59 0%, #071931 100%)',
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 44, height: 44 }}>
                    <TravelExploreIcon sx={{ fontSize: 26 }} />
                  </Avatar>
                  <Typography variant="h4" fontWeight={800} color="#FFFFFF">
                    Trip<span style={{ color: '#FF6B4A' }}>Tune</span>
                  </Typography>
                </Box>

                <Typography
                  variant="h2"
                  fontWeight={800}
                  color="#FFFFFF"
                  sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' }, mb: 2 }}
                >
                  Start your intelligent travel journey.
                </Typography>

                <Typography variant="body1" sx={{ opacity: 0.85, lineHeight: 1.7, mb: 4 }}>
                  Create your free account to unlock personal travel profiles, smart destination
                  matching, and real-time itinerary adaptation.
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[
                    'Mood & Interest-based destination recommendation',
                    'Dynamic itinerary generation tailored to your pace',
                    'Smart budget and energy level optimization',
                  ].map((feature, i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <CheckCircleOutlineIcon sx={{ color: '#FF6B4A', fontSize: 20 }} />
                      <Typography variant="body2" color="#FFFFFF" sx={{ opacity: 0.9 }}>
                        {feature}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Grid>

            {/* Right Form Panel */}
            <Grid
              item
              xs={12}
              md={6}
              sx={{
                p: { xs: 3, sm: 5, md: 6 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                backgroundColor: '#FFFFFF',
              }}
            >
              <Box sx={{ mb: 4 }}>
                <Typography variant="h3" fontWeight={800} gutterBottom>
                  Create your account
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Fill in your details below to get started.
                </Typography>
              </Box>

              <RegisterForm />
            </Grid>
          </Grid>
        </Card>
      </Container>
    </Box>
  );
};
