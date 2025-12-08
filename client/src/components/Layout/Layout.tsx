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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBars,
  faUserCircle,
  faSignOutAlt,
  faBell,
  faCog,
  faEnvelope,
  faLock,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';
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

  // Auto-collapse sidebar when entering group chat or chats
  useEffect(() => {
    if (location.pathname.startsWith('/group-chats') || location.pathname.startsWith('/chats')) {
      setCollapsed(true);
    } else {
      // Restore sidebar when leaving chat pages
      setCollapsed(false);
    }
  }, [location.pathname]);

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
  const isGroupChat = location.pathname.startsWith('/group-chats');
  const isChat = location.pathname.startsWith('/chats');
  const hideHeader = isGroupChat || isChat;

  return (
    <Box sx={{ display: 'flex', overflowX: 'hidden', width: '100%', maxWidth: '100vw' }}>
      {!hideHeader && (
        <AppBar
          position="fixed"
          sx={{
            width: { xs: '100%', sm: `calc(100% - ${sidebarWidth}px)` },
            ml: { xs: 0, sm: `${sidebarWidth}px` },
            transition: theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            backgroundColor: '#ffffff',
            color: 'text.primary',
            boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
            borderBottom: '1px solid #e0e0e0',
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
        >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { xs: 'flex', sm: 'none' },
              minWidth: 40,
              minHeight: 40,
            }}
          >
            <FontAwesomeIcon icon={faBars} style={{ fontSize: '20px' }} />
          </IconButton>
          <IconButton
            color="inherit"
            aria-label="toggle sidebar"
            edge="start"
            onClick={() => setCollapsed(!collapsed)}
            sx={{ 
              mr: 2, 
              display: { xs: 'none', sm: 'flex' },
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <FontAwesomeIcon icon={faBars} style={{ fontSize: '18px' }} />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600, color: 'text.primary', display: { xs: 'none', md: 'block' } }}>
            {getPageTitle()}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton
              size="small"
              sx={{
                color: 'text.secondary',
                position: 'relative',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <FontAwesomeIcon icon={faBell} />
            </IconButton>
            <Box
              onClick={handleMenuOpen}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                px: 1,
                py: 0.5,
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: '#e0e0e0',
                  border: '1px solid #d0d0d0',
                }}
                src={getAvatarUrl()}
                key={`avatar-${avatarKey}-${user?.avatar || ''}`}
              >
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              <Typography 
                variant="body2" 
                sx={{ 
                  display: { xs: 'none', sm: 'block' }, 
                  fontWeight: 500,
                  color: 'text.primary',
                }}
              >
                {user?.name || 'User'}
              </Typography>
              <FontAwesomeIcon 
                icon={faChevronDown}
                style={{ 
                  fontSize: 18, 
                  color: 'inherit',
                  display: window.innerWidth >= 600 ? 'block' : 'none',
                }} 
              />
            </Box>
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
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 200,
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                '& .MuiMenuItem-root': {
                  px: 2,
                  py: 1.25,
                  fontSize: '0.875rem',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                  '& .MuiSvgIcon-root': {
                    fontSize: 18,
                    color: '#666666',
                    mr: 1.5,
                  },
                },
              },
            }}
          >
            <MenuItem onClick={() => { handleMenuClose(); }}>
              <FontAwesomeIcon icon={faCog} style={{ fontSize: 18, marginRight: 12, color: '#666666' }} />
              Settings
            </MenuItem>
            <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
              <FontAwesomeIcon icon={faUserCircle} style={{ fontSize: 18, marginRight: 12, color: '#666666' }} />
              Profile
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); }}>
              <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: 18, marginRight: 12, color: '#666666' }} />
              My Messages
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); }}>
              <FontAwesomeIcon icon={faLock} style={{ fontSize: 18, marginRight: 12, color: '#666666' }} />
              Lock Screen
            </MenuItem>
            <MenuItem 
              onClick={handleLogout}
              sx={{
                '&:hover': {
                  backgroundColor: '#fee',
                },
              }}
            >
              <FontAwesomeIcon icon={faSignOutAlt} style={{ fontSize: 18, marginRight: 12, color: '#d32f2f' }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      )}
      {/* Mobile sidebar - temporary drawer */}
      <Sidebar
        variant="temporary"
        mobileOpen={mobileOpen}
        onClose={handleDrawerToggle}
      />
      {/* Desktop sidebar - permanent drawer, hidden on mobile */}
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        <Sidebar
          variant="permanent"
          collapsed={collapsed}
          onCollapseChange={setCollapsed}
        />
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: hideHeader ? 0 : 3,
          width: { sm: `calc(100% - ${sidebarWidth}px)` },
          maxWidth: { sm: `calc(100vw - ${sidebarWidth}px)` },
          mt: hideHeader ? 0 : 8,
          overflowX: 'hidden',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          backgroundColor: hideHeader ? 'transparent' : '#f8f9fa',
          minHeight: hideHeader ? '100vh' : 'calc(100vh - 64px)',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

