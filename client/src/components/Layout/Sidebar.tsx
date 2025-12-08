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
import IconButton from '@mui/material/IconButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faFolder,
  faBox,
  faUser,
  faUsers,
  faLock,
  faChartBar,
  faFileAlt,
  faComments,
  faListAlt,
  faExchangeAlt,
  faShoppingCart,
  faChevronLeft,
  faChevronRight,
  faChevronDown,
  faChevronUp,
} from '@fortawesome/free-solid-svg-icons';
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
  { text: 'Dashboard', icon: <FontAwesomeIcon icon={faHome} />, path: '/' },
  { text: 'Dự án', icon: <FontAwesomeIcon icon={faFolder} />, path: '/projects' },
  {
    text: 'Vật tư',
    icon: <FontAwesomeIcon icon={faBox} />,
    path: '/materials',
    submenu: [
      { text: 'Danh sách vật tư', icon: <FontAwesomeIcon icon={faListAlt} />, path: '/materials/list' },
      { text: 'Nhập xuất kho', icon: <FontAwesomeIcon icon={faExchangeAlt} />, path: '/materials/transactions' },
      { text: 'Đề xuất mua hàng', icon: <FontAwesomeIcon icon={faShoppingCart} />, path: '/materials/purchase-requests' },
    ],
  },
  { text: 'Nhân sự', icon: <FontAwesomeIcon icon={faUsers} />, path: '/personnel' },
  { text: 'Vai trò', icon: <FontAwesomeIcon icon={faLock} />, path: '/roles' },
  { text: 'Group Chat', icon: <FontAwesomeIcon icon={faComments} />, path: '/chats' },
  {
    text: 'Báo cáo',
    icon: <FontAwesomeIcon icon={faChartBar} />,
    path: '/reports',
    submenu: [
      { text: 'Báo cáo ngày', icon: <FontAwesomeIcon icon={faFileAlt} />, path: '/daily-reports' },
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
          background: '#2c3e50',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          gap: 2,
          minHeight: '64px !important',
          cursor: 'default',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
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
      </Toolbar>
      <Divider />
      <List
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          py: 0.5,
          backgroundColor: '#2c3e50',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 0,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
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
                    minHeight: 42,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2,
                    py: 0.75,
                    my: 0.25,
                    mx: 1,
                    borderRadius: 0,
                    backgroundColor: itemActive && !hasSubmenu
                      ? 'rgba(52, 152, 219, 0.15)'
                      : 'transparent',
                    borderLeft: itemActive && !hasSubmenu ? '3px solid' : '3px solid transparent',
                    borderColor: itemActive && !hasSubmenu ? '#3498db' : 'transparent',
                    color: itemActive && !hasSubmenu ? '#3498db' : 'rgba(255, 255, 255, 0.75)',
                    '&:hover': {
                      backgroundColor: itemActive && !hasSubmenu
                        ? 'rgba(52, 152, 219, 0.2)'
                        : 'rgba(255, 255, 255, 0.05)',
                      color: itemActive && !hasSubmenu ? '#3498db' : 'rgba(255, 255, 255, 0.95)',
                      transition: 'all 0.2s ease-in-out',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 2.5 : 'auto',
                      justifyContent: 'center',
                      color: 'inherit',
                      '& svg': {
                        fontSize: '18px',
                      },
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
                    <Box sx={{ opacity: open ? 1 : 0, ml: 'auto' }}>
                      {submenuOpen ? <FontAwesomeIcon icon={faChevronUp} style={{ fontSize: '18px' }} /> : <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: '18px' }} />}
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
                            pl: 5,
                            py: 0.75,
                            mx: 1,
                            minHeight: 38,
                            borderRadius: 0,
                            backgroundColor: subActive
                              ? 'rgba(52, 152, 219, 0.15)'
                              : 'transparent',
                            borderLeft: subActive ? '3px solid' : '3px solid transparent',
                            borderColor: subActive ? '#3498db' : 'transparent',
                            color: subActive ? '#3498db' : 'rgba(255, 255, 255, 0.65)',
                            '&:hover': {
                              backgroundColor: subActive
                                ? 'rgba(52, 152, 219, 0.2)'
                                : 'rgba(255, 255, 255, 0.04)',
                              color: subActive ? '#3498db' : 'rgba(255, 255, 255, 0.85)',
                              transition: 'all 0.2s ease-in-out',
                            },
                            transition: 'all 0.2s ease-in-out',
                          }}
                        >
                          <FontAwesomeIcon 
                            icon={faChevronRight}
                            style={{ 
                              fontSize: '16px', 
                              marginRight: '12px',
                              color: 'inherit',
                              opacity: 0.7,
                            }} 
                          />
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
            borderRight: '1px solid rgba(0, 0, 0, 0.1)',
            backgroundColor: '#2c3e50',
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

