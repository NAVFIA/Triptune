import React from 'react';
import { Box, Grid, Typography, Avatar, Paper } from '@mui/material';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SpeedIcon from '@mui/icons-material/Speed';

import { LoginForm } from '../features/auth/LoginForm';
import travelHero from '../assets/travel_hero.png';

export const LoginPage: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#F8FAFC',
        display: 'flex',
      }}
    >
      <Grid container sx={{ minHeight: '100vh', width: '100%', m: 0 }}>
            {/* Left Visual Panel */}
            <Grid
              size={{ xs: 12, md: 6 }}
              sx={{
                position: 'relative',
                color: '#FFFFFF',
                p: { xs: 4, md: 6 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                backgroundImage: `url(${travelHero})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                overflow: 'hidden',
                minHeight: { xs: 350, md: 550 },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(15, 44, 89, 0.72)', // Deep blue theme overlay
                  backdropFilter: 'blur(1.5px)',
                  zIndex: 1,
                },
              }}
            >
              {/* Header Logo */}
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 44, height: 44 }}>
                    <TravelExploreIcon sx={{ fontSize: 26, color: '#FFFFFF' }} />
                  </Avatar>
                  <Typography variant="h4" color="#FFFFFF" sx={{ fontWeight: 800 }}>
                    Trip<span style={{ color: '#FF6B4A' }}>Tune</span>
                  </Typography>
                </Box>

                <Typography
                  variant="h2"
                  color="#FFFFFF"
                  sx={{
                    fontSize: { xs: '1.75rem', md: '2.25rem' },
                    mb: 2,
                    fontWeight: 800,
                    lineHeight: 1.25,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Travel Planning, tuned to your mood.
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    opacity: 0.9,
                    lineHeight: 1.7,
                    maxWidth: 480,
                    fontSize: '1rem',
                  }}
                >
                  TripTune dynamically recommends destinations and builds day-by-day itineraries
                  aligned with your energy, budget, and travel preferences.
                </Typography>
              </Box>

              {/* Floating Glassmorphic Features */}
              <Box
                sx={{
                  position: 'relative',
                  zIndex: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  mt: 4,
                  maxWidth: 400,
                }}
              >
                {/* Mood Badge */}
                <Paper
                  elevation={0}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 1.5,
                    borderRadius: 3,
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#FFFFFF',
                  }}
                >
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36 }}>
                    <FavoriteIcon sx={{ fontSize: 18, color: '#FFFFFF' }} />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.85rem' }}>
                      Mood-Aware Matching
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', fontSize: '0.75rem' }}>
                      Recommendations powered by Weka Random Forest ML models.
                    </Typography>
                  </Box>
                </Paper>

                {/* Budget Badge */}
                <Paper
                  elevation={0}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 1.5,
                    borderRadius: 3,
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#FFFFFF',
                  }}
                >
                  <Avatar sx={{ bgcolor: 'rgba(16, 185, 129, 0.9)', width: 36, height: 36 }}>
                    <AttachMoneyIcon sx={{ fontSize: 18, color: '#FFFFFF' }} />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.85rem' }}>
                      Smart Budget Planning
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', fontSize: '0.75rem' }}>
                      Compare cost structures and keep estimated trip expenses within limits.
                    </Typography>
                  </Box>
                </Paper>

                {/* Pace Badge */}
                <Paper
                  elevation={0}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 1.5,
                    borderRadius: 3,
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#FFFFFF',
                  }}
                >
                  <Avatar sx={{ bgcolor: 'rgba(2, 132, 199, 0.9)', width: 36, height: 36 }}>
                    <SpeedIcon sx={{ fontSize: 18, color: '#FFFFFF' }} />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.85rem' }}>
                      Adaptive Travel Pace
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', fontSize: '0.75rem' }}>
                      Configure waking hours, travel speed, and schedule constraints dynamically.
                    </Typography>
                  </Box>
                </Paper>
              </Box>

              {/* Bottom tag */}
              <Box sx={{ position: 'relative', zIndex: 2, mt: 4 }}>
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
                  <Typography variant="caption" color="#FFFFFF" sx={{ fontWeight: 700 }}>
                    Mood-Aware Adaptive Planner Engine
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Right Form Panel */}
            <Grid
              className="auth-right-panel"
              size={{ xs: 12, md: 6 }}
              sx={{
                p: { xs: 4, sm: 6, md: 8 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                backgroundColor: '#0B1329',
                borderLeft: { md: '1px solid rgba(255, 255, 255, 0.08)' },
                borderTop: { xs: '1px solid rgba(255, 255, 255, 0.08)', md: 'none' },
                color: '#F8FAFC',
              }}
            >
              <Box sx={{ mb: 4 }}>
                <Typography
                  variant="h3"
                  gutterBottom
                  sx={{
                    fontWeight: 800,
                    fontSize: '1.85rem',
                    letterSpacing: '-0.02em',
                    color: 'primary.main',
                    textShadow: '0 0 10px rgba(59, 130, 246, 0.3)',
                  }}
                >
                  Welcome back
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please enter your email and password to access your trips.
                </Typography>
              </Box>

              <LoginForm />
            </Grid>
          </Grid>
    </Box>
  );
};
