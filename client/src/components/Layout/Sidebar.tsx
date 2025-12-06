import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  Toolbar,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  alpha,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ConstructionIcon from '@mui/icons-material/Construction';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import BuildIcon from '@mui/icons-material/Build';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import IconButton from '@mui/material/IconButton';

const drawerWidth = 280;
const collapsedWidth = 64;

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
}

const menuItems: MenuItem[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Dự án', icon: <ConstructionIcon />, path: '/projects' },
  { text: 'Vật tư', icon: <InventoryIcon />, path: '/materials' },
  { text: 'Nhân sự', icon: <PeopleIcon />, path: '/personnel' },
  { text: 'Thiết bị', icon: <BuildIcon />, path: '/equipment' },
  { text: 'Hợp đồng', icon: <DescriptionIcon />, path: '/contracts' },
  { text: 'Nhật ký công trường', icon: <AssignmentIcon />, path: '/site-logs' },
];

interface SidebarProps {
  variant?: 'permanent' | 'temporary';
  open?: boolean;
  onClose?: () => void;
  mobileOpen?: boolean;
  collapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
}

export default function Sidebar({ 
  variant = 'permanent', 
  open: controlledOpen, 
  onClose, 
  mobileOpen,
  collapsed: controlledCollapsed,
  onCollapseChange
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const collapsed = controlledCollapsed !== undefined ? controlledCollapsed : internalCollapsed;
  const open = variant === 'temporary' ? mobileOpen : !collapsed;

  const handleCollapse = () => {
    const newCollapsed = !collapsed;
    if (onCollapseChange) {
      onCollapseChange(newCollapsed);
    } else {
      setInternalCollapsed(newCollapsed);
    }
  };

  const handleItemClick = (item: MenuItem) => {
    navigate(item.path);
    if (variant === 'temporary' && onClose) {
      onClose();
    }
  };

  const isActive = (path: string): boolean => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar
        sx={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          gap: 2,
          minHeight: '64px !important',
          cursor: !open ? 'pointer' : 'default',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
        }}
        onClick={!open ? handleCollapse : undefined}
      >
        {open && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
            <ConstructionIcon />
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
              Admin Panel
            </Typography>
          </Box>
        )}
        {!open && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <ConstructionIcon />
          </Box>
        )}
        {variant === 'permanent' && open && (
          <IconButton
            onClick={handleCollapse}
            sx={{
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <List
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          py: 1,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: (theme) => alpha(theme.palette.text.secondary, 0.2),
            borderRadius: '3px',
            '&:hover': {
              backgroundColor: (theme) => alpha(theme.palette.text.secondary, 0.3),
            },
          },
        }}
      >
        {menuItems.map((item) => {
          const itemActive = isActive(item.path);
          return (
            <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                onClick={() => handleItemClick(item)}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  my: 0.5,
                  mx: 1,
                  borderRadius: 0,
                  backgroundColor: itemActive
                    ? 'rgba(25, 118, 210, 0.2)'
                    : 'transparent',
                  borderLeft: itemActive ? '4px solid' : '4px solid transparent',
                  borderColor: itemActive ? '#42a5f5' : 'transparent',
                  color: itemActive ? '#42a5f5' : 'rgba(255, 255, 255, 0.7)',
                  '&:hover': {
                    backgroundColor: itemActive
                      ? 'rgba(25, 118, 210, 0.25)'
                      : 'rgba(255, 255, 255, 0.08)',
                    color: itemActive ? '#42a5f5' : 'rgba(255, 255, 255, 0.9)',
                    transform: 'translateX(4px)',
                    transition: 'all 0.2s ease-in-out',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                    color: 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: itemActive ? 600 : 500,
                    color: 'inherit',
                  }}
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={variant === 'temporary' ? mobileOpen : true}
      onClose={onClose}
      ModalProps={{
        keepMounted: true,
      }}
        sx={{
          width: variant === 'permanent' ? (open ? drawerWidth : collapsedWidth) : drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: variant === 'permanent' ? (open ? drawerWidth : collapsedWidth) : drawerWidth,
            boxSizing: 'border-box',
            transition: (theme) =>
              theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            borderRight: 'none',
            backgroundColor: '#1e293b',
            color: 'rgba(255, 255, 255, 0.9)',
            overflowX: 'hidden',
            boxShadow: '4px 0px 24px rgba(0, 0, 0, 0.12)',
            borderRadius: 0,
          },
        }}
    >
      {drawer}
    </Drawer>
  );
}

