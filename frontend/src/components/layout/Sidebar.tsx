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
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import LuggageOutlinedIcon from '@mui/icons-material/LuggageOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
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
    { text: 'Travel Profile', icon: <PersonOutlineIcon />, path: '/profile' },
    { text: 'Destinations', icon: <ExploreOutlinedIcon />, path: '/destinations' },
    {
      text: 'Itinerary',
      icon: <CalendarTodayOutlinedIcon />,
      path: '#',
      disabled: true,
      tag: 'Soon',
    },
    {
      text: 'Budget',
      icon: <AccountBalanceWalletOutlinedIcon />,
      path: '#',
      disabled: true,
      tag: 'Soon',
    },
  ];

  const drawerContent = (
    <Box sx={{ overflow: 'auto', mt: 1 }}>
      <List sx={{ px: 2 }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path;
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
                  backgroundColor: active ? '#F1F5F9' : 'transparent',
                  color: active ? 'primary.main' : 'text.primary',
                  fontWeight: active ? 700 : 500,
                  '&:hover': {
                    backgroundColor: active ? '#F1F5F9' : '#F8FAFC',
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
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: active ? 700 : 500,
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
                      backgroundColor: '#E2E8F0',
                      color: '#475569',
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
            borderRight: '1px solid #E2E8F0',
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
            borderRight: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
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
