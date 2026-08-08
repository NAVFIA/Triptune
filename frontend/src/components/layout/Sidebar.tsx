import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  Toolbar,
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';
import LuggageOutlinedIcon from '@mui/icons-material/LuggageOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { useLocation, useNavigate } from 'react-router-dom';

const DRAWER_WIDTH = 260;

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

interface NavItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  disabled?: boolean;
  tag?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onMobileClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems: NavItem[] = [
    { text: 'Dashboard', icon: <DashboardOutlinedIcon />, path: '/dashboard' },
    { text: 'Create Trip', icon: <AddCircleOutlineIcon />, path: '/trips/create' },
    { text: 'My Trips', icon: <LuggageOutlinedIcon />, path: '/trips' },
    { text: 'Planned Trips', icon: <CheckCircleOutlineIcon />, path: '/trips?filter=planned' },
    { text: 'Travel Profile', icon: <PersonOutlineIcon />, path: '/profile' },
    { text: 'Destinations', icon: <ExploreOutlinedIcon />, path: '/destinations' },
  ];

  const drawerContent = (
    <Box sx={{ overflow: 'auto', mt: 1 }}>
      <List sx={{ px: 2 }}>
        {navItems.map((item) => {
          const active = (location.pathname + location.search) === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                disabled={item.disabled}
                onClick={() => {
                  if (!item.disabled) {
                    navigate(item.path);
                    onMobileClose();
                  }
                }}
                sx={{
                  borderRadius: '10px',
                  py: 1.2,
                  px: 2,
                  backgroundColor: active ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                  color: active ? 'primary.main' : 'text.secondary',
                  fontWeight: active ? 700 : 500,
                  position: 'relative',
                  '&::before': active
                    ? {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: '25%',
                        bottom: '25%',
                        width: '4px',
                        borderRadius: '0 4px 4px 0',
                        backgroundColor: '#3B82F6',
                        boxShadow: '0 0 10px #3B82F6',
                      }
                    : undefined,
                  '&:hover': {
                    backgroundColor: active ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                    color: '#F8FAFC',
                    '& .MuiListItemIcon-root': {
                      color: '#3B82F6',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: active ? 'primary.main' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  slotProps={{
                    primary: {
                      sx: {
                        fontSize: '0.9rem',
                        fontWeight: active ? 700 : 500,
                      }
                    }
                  }}
                />
                {item.tag && (
                  <Chip
                    label={item.tag}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      backgroundColor: 'rgba(139, 92, 246, 0.15)',
                      color: '#A78BFA',
                      border: 'none',
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      aria-label="mailbox folders"
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: '#030712',
          },
        }}
      >
        <Toolbar />
        {drawerContent}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(3, 7, 18, 0.4)',
            backdropFilter: 'blur(16px)',
          },
        }}
        open
      >
        <Toolbar />
        {drawerContent}
      </Drawer>
    </Box>
  );
};
