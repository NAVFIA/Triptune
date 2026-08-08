import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface TopBarProps {
  onMobileDrawerToggle?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onMobileDrawerToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'rgba(3, 7, 18, 0.75)',
        color: '#F8FAFC',
        backdropFilter: 'blur(12px)',
        boxShadow: 'none',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {onMobileDrawerToggle && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={onMobileDrawerToggle}
              sx={{ mr: 1, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box
            onClick={() => navigate('/')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 38,
                height: 38,
                boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)',
              }}
            >
              <TravelExploreIcon sx={{ color: '#FFFFFF', fontSize: 22 }} />
            </Avatar>
            <Typography variant="h5" color="primary.main" sx={{ fontWeight: 800, letterSpacing: "-0.02em", textShadow: '0 0 10px rgba(59, 130, 246, 0.3)' }}>
              Trip<span style={{ color: '#06B6D4', textShadow: '0 0 10px rgba(6, 182, 212, 0.5)' }}>Tune</span>
            </Typography>
          </Box>
        </Box>

        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              onClick={handleMenuOpen}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: 'pointer',
                p: 0.5,
                pr: 1.5,
                borderRadius: '20px',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
              }}
            >
              <Avatar
                sx={{
                  bgcolor: 'secondary.main',
                  width: 36,
                  height: 36,
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  boxShadow: '0 0 10px rgba(139, 92, 246, 0.4)',
                }}
              >
                {getInitials(user.fullName)}
              </Avatar>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, display: { xs: 'none', sm: 'block' }, color: '#F8FAFC' }}
              >
                {user.fullName}
              </Typography>
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              slotProps={{
                paper: {
                  sx: {
                    width: 200,
                    mt: 1.5,
                    borderRadius: 3,
                    backgroundColor: '#0B1329',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                    color: '#F8FAFC',
                  },
                }
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#F8FAFC' }}>
                  {user.fullName}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                  {user.email}
                </Typography>
              </Box>
              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />
              <MenuItem onClick={handleProfileClick} sx={{ py: 1.2, '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' } }}>
                <ListItemIcon>
                  <PersonOutlineIcon fontSize="small" sx={{ color: '#94A3B8' }} />
                </ListItemIcon>
                Travel Profile
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ py: 1.2, color: 'error.main', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.08)' } }}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" color="error" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};
