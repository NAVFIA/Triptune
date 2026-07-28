import React from 'react';
import { Box, Card, Container, Grid, Typography, Avatar } from '@mui/material';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { LoginForm } from '../features/auth/LoginForm';

export const LoginPage: React.FC = () => {
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
            <Grid size={{xs: 12, md: 6}} 
              sx={{
                backgroundColor: 'primary.main',
                color: '#FFFFFF',
                p: { xs: 4, md: 6 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                backgroundImage: 'linear-gradient(135deg, #0F2C59 0%, #071931 100%)',
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 44, height: 44 }}>
                    <TravelExploreIcon sx={{ fontSize: 26 }} />
                  </Avatar>
                  <Typography variant="h4" color="#FFFFFF" sx={{ fontWeight: 800 }}>
                    Trip<span style={{ color: '#FF6B4A' }}>Tune</span>
                  </Typography>
                </Box>

                <Typography
                  variant="h2"
                  color="#FFFFFF"
                  sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' }, mb: 2, fontWeight: 800 }}
                >
                  Travel Planning, tuned to your mood.
                </Typography>

                <Typography variant="body1" sx={{ opacity: 0.85, lineHeight: 1.7, maxW: 480 }}>
                  TripTune dynamically recommends destinations and builds day-by-day itineraries
                  aligned with your energy, budget, and travel preferences.
                </Typography>
              </Box>

              <Box sx={{ mt: { xs: 4, md: 8 } }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 1,
                    borderRadius: '20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <AutoAwesomeIcon sx={{ color: '#FF6B4A', fontSize: 18 }} />
                  <Typography variant="caption" color="#FFFFFF" sx={{ fontWeight: 600 }}>
                    Adaptive & Mood-Aware Recommendation Engine
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Right Form Panel */}
            <Grid size={{xs: 12, md: 6}} 
              sx={{
                p: { xs: 3, sm: 5, md: 6 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                backgroundColor: '#FFFFFF',
              }}
            >
              <Box sx={{ mb: 4 }}>
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 800 }}>
                  Welcome back
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please enter your credentials to access your trips.
                </Typography>
              </Box>

              <LoginForm />
            </Grid>
          </Grid>
        </Card>
      </Container>
    </Box>
  );
};
