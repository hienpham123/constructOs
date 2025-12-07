import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useAuthStore } from '../../stores/authStore';
import Sidebar from './Sidebar';

const drawerWidth = 280;
const collapsedWidth = 64;

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [avatarKey, setAvatarKey] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, refreshUser } = useAuthStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/projects')) return 'Quản lý dự án';
    if (path.startsWith('/materials')) return 'Quản lý vật tư';
    if (path.startsWith('/personnel')) return 'Quản lý nhân sự';
    if (path.startsWith('/roles')) return 'Quản lý vai trò';
    if (path.startsWith('/dashboard') || path === '/') return 'Dashboard';
    if (path.startsWith('/profile')) return 'Hồ sơ';
    return 'Quản lý công ty xây dựng';
  };

  // Refresh user data when component mounts to get latest avatar
  useEffect(() => {
    if (user) {
      refreshUser().then(() => {
        // Force avatar reload after refresh
        setAvatarKey(prev => prev + 1);
      });
    }
  }, []); // Only run once on mount

  // Update avatar key when user avatar changes
  useEffect(() => {
    if (user?.avatar) {
      setAvatarKey(prev => prev + 1);
    }
  }, [user?.avatar]);

  // Get avatar URL with cache busting
  const getAvatarUrl = () => {
    if (!user?.avatar) return undefined;
    // Add timestamp to force browser to reload image
    const separator = user.avatar.includes('?') ? '&' : '?';
    const cacheBuster = user.updatedAt ? new Date(user.updatedAt).getTime() : Date.now();
    return `${user.avatar}${separator}_t=${cacheBuster}`;
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const sidebarWidth = collapsed && !isMobile ? collapsedWidth : drawerWidth;

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${sidebarWidth}px)` },
          ml: { sm: `${sidebarWidth}px` },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          backgroundColor: '#fee2e2',
          color: 'text.primary',
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
          borderBottom: '1px solid #fecaca',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600, color: 'text.primary', display: { xs: 'none', md: 'block' } }}>
            {getPageTitle()}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              size="small"
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <NotificationsIcon />
            </IconButton>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 500 }}>
              {user?.name}
            </Typography>
            <IconButton
              onClick={handleMenuOpen}
              size="small"
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'primary.main',
                  border: '2px solid',
                  borderColor: 'primary.light',
                }}
                src={getAvatarUrl()}
                key={`avatar-${avatarKey}-${user?.avatar || ''}`}
              >
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
          </Box>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
              <AccountCircleIcon sx={{ mr: 1 }} />
              Hồ sơ
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 1 }} />
              Đăng xuất
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Sidebar
        variant="temporary"
        mobileOpen={mobileOpen}
        onClose={handleDrawerToggle}
      />
      <Sidebar
        variant="permanent"
        collapsed={collapsed}
        onCollapseChange={setCollapsed}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${sidebarWidth}px)` },
          mt: 8,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          backgroundColor: '#f5f7fa',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

