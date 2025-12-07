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
  Collapse,
  alpha,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ConstructionIcon from '@mui/icons-material/Construction';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SecurityIcon from '@mui/icons-material/Security';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DescriptionIcon from '@mui/icons-material/Description';
import IconButton from '@mui/material/IconButton';
import logoImage from '../../images/logo.svg';

const drawerWidth = 280;
const collapsedWidth = 64;

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
  submenu?: MenuItem[];
}

const menuItems: MenuItem[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Dự án', icon: <ConstructionIcon />, path: '/projects' },
  {
    text: 'Vật tư',
    icon: <InventoryIcon />,
    path: '/materials',
    submenu: [
      { text: 'Danh sách vật tư', icon: <ListAltIcon />, path: '/materials/list' },
      { text: 'Nhập xuất kho', icon: <SwapHorizIcon />, path: '/materials/transactions' },
      { text: 'Đề xuất mua hàng', icon: <ShoppingCartIcon />, path: '/materials/purchase-requests' },
    ],
  },
  { text: 'Nhân sự', icon: <PeopleIcon />, path: '/personnel' },
  { text: 'Vai trò', icon: <SecurityIcon />, path: '/roles' },
  {
    text: 'Báo cáo',
    icon: <AssessmentIcon />,
    path: '/reports',
    submenu: [
      { text: 'Báo cáo ngày', icon: <DescriptionIcon />, path: '/daily-reports' },
    ],
  },
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
  onClose, 
  mobileOpen,
  collapsed: controlledCollapsed,
  onCollapseChange
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<{ [key: string]: boolean }>({
    '/materials': true, // Default open
    '/reports': true, // Default open
  });
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
    if (item.submenu && item.submenu.length > 0) {
      // Toggle submenu
      if (open) {
        setOpenSubmenus((prev) => ({
          ...prev,
          [item.path]: !prev[item.path],
        }));
      }
    } else {
      navigate(item.path);
      if (variant === 'temporary' && onClose) {
        onClose();
      }
    }
  };

  const handleSubmenuClick = (subItem: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(subItem.path);
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

  const isSubmenuActive = (subItem: MenuItem): boolean => {
    return location.pathname === subItem.path;
  };

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar
        sx={{
          background: '#1e293b',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          gap: 2,
          minHeight: '64px !important',
          cursor: !open ? 'pointer' : 'default',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
        onClick={!open ? handleCollapse : undefined}
      >
        {open && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={logoImage}
                alt="Logo"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </Box>
          </Box>
        )}
        {!open && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={logoImage}
                alt="Logo"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </Box>
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
            borderRadius: 0,
            '&:hover': {
              backgroundColor: (theme) => alpha(theme.palette.text.secondary, 0.3),
            },
          },
        }}
      >
        {menuItems.map((item) => {
          const itemActive = isActive(item.path);
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const submenuOpen = openSubmenus[item.path] || false;
          
          return (
            <Box key={item.text}>
              <ListItem disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  onClick={() => handleItemClick(item)}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    my: 0.5,
                    mx: 1,
                    borderRadius: 0,
                    backgroundColor: itemActive && !hasSubmenu
                      ? 'rgba(220, 38, 38, 0.15)'
                      : 'transparent',
                    borderLeft: itemActive && !hasSubmenu ? '3px solid' : '3px solid transparent',
                    borderColor: itemActive && !hasSubmenu ? '#dc2626' : 'transparent',
                    color: itemActive && !hasSubmenu ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                    '&:hover': {
                      backgroundColor: itemActive && !hasSubmenu
                        ? 'rgba(220, 38, 38, 0.2)'
                        : 'rgba(255, 255, 255, 0.06)',
                      color: itemActive && !hasSubmenu ? '#ffffff' : 'rgba(255, 255, 255, 0.9)',
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
                  {open && hasSubmenu && (
                    <Box sx={{ opacity: open ? 1 : 0 }}>
                      {submenuOpen ? <ExpandLess /> : <ExpandMore />}
                    </Box>
                  )}
                </ListItemButton>
              </ListItem>
              {hasSubmenu && open && (
                <Collapse in={submenuOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.submenu!.map((subItem) => {
                      const subActive = isSubmenuActive(subItem);
                      return (
                        <ListItemButton
                          key={subItem.text}
                          onClick={(e) => handleSubmenuClick(subItem, e)}
                          sx={{
                            pl: 6,
                            py: 1,
                            mx: 1,
                            borderRadius: 0,
                            backgroundColor: subActive
                              ? 'rgba(220, 38, 38, 0.15)'
                              : 'transparent',
                            borderLeft: subActive ? '3px solid' : '3px solid transparent',
                            borderColor: subActive ? '#dc2626' : 'transparent',
                            color: subActive ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                            '&:hover': {
                              backgroundColor: subActive
                                ? 'rgba(220, 38, 38, 0.2)'
                                : 'rgba(255, 255, 255, 0.04)',
                              color: subActive ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
                              transition: 'all 0.2s ease-in-out',
                            },
                            transition: 'all 0.2s ease-in-out',
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: 0,
                              mr: 2,
                              justifyContent: 'center',
                              color: 'inherit',
                            }}
                          >
                            {subItem.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={subItem.text}
                            primaryTypographyProps={{
                              fontSize: '0.8125rem',
                              fontWeight: subActive ? 600 : 400,
                              color: 'inherit',
                            }}
                          />
                        </ListItemButton>
                      );
                    })}
                  </List>
                </Collapse>
              )}
            </Box>
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
            borderRight: '1px solid #e5e7eb',
            backgroundColor: '#1e293b',
            color: 'rgba(255, 255, 255, 0.9)',
            overflowX: 'hidden',
            boxShadow: 'none',
            borderRadius: 0,
          },
        }}
    >
      {drawer}
    </Drawer>
  );
}

