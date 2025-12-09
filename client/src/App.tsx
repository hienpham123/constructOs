import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import ProjectAddEdit from './pages/ProjectAddEdit';
import Materials from './pages/Materials';
import MaterialAddEdit from './pages/MaterialAddEdit';
import TransactionAddEdit from './pages/TransactionAddEdit';
import PurchaseRequestAddEdit from './pages/PurchaseRequestAddEdit';
import Personnel from './pages/Personnel';
import PersonnelAddEdit from './pages/PersonnelAddEdit';
import Roles from './pages/Roles';
import RolesAddEdit from './pages/RolesAddEdit';
import DailyReports from './pages/DailyReports';
import DailyReportAddEdit from './pages/DailyReportAddEdit';
import Profile from './pages/Profile';
import GroupChats from './pages/GroupChats';
import Chats from './pages/Chats';
import { useAuthStore } from './stores/authStore';
import { useInactivityTimer } from './hooks/useInactivityTimer';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4680ff', // Primary button color
      light: '#79a3ff', // Hover state
      dark: '#0956ff', // Active state
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#dc2626', // Đỏ
      light: '#ef4444',
      dark: '#b91c1c',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#6b7280',
    },
    success: {
      main: '#93BE52', // Normal
      light: '#aacc77', // Hover
      dark: '#73993a', // Active
      contrastText: '#ffffff',
    },
    warning: {
      main: '#FFB64D', // Normal
      light: '#ffcb80', // Hover
      dark: '#ff9d10', // Active
      contrastText: '#ffffff',
    },
    error: {
      main: '#FC6180', // Normal (Danger)
      light: '#fd93a8', // Hover
      dark: '#fb2550', // Active
      contrastText: '#ffffff',
    },
    info: {
      main: '#4680ff', // Same as primary
      light: '#79a3ff',
      dark: '#0956ff',
      contrastText: '#ffffff',
    },
    grey: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
  },
  typography: {
    fontFamily: 'SegoeuiPc,Segoe UI,San Francisco,Helvetica Neue,Helvetica,Lucida Grande,Roboto,Ubuntu,Tahoma,Microsoft Sans Serif,Arial,sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.2,
      color: '#1a1a1a',
    },
    h2: {
      fontWeight: 700,
      fontSize: '1.75rem',
      lineHeight: 1.3,
      color: '#1a1a1a',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
      color: '#1a1a1a',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
      color: '#1a1a1a',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.5,
      color: '#1a1a1a',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#1a1a1a',
    },
    body2: {
      fontSize: '0.8125rem',
      lineHeight: 1.5,
      color: '#6b7280',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.875rem',
    },
  },
  shape: {
    borderRadius: 0,
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(0, 0, 0, 0.05)',
    '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
    '0px 4px 6px rgba(0, 0, 0, 0.07), 0px 2px 4px rgba(0, 0, 0, 0.06)',
    '0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05)',
    '0px 20px 25px rgba(0, 0, 0, 0.1), 0px 10px 10px rgba(0, 0, 0, 0.04)',
    '0px 25px 50px rgba(0, 0, 0, 0.25)',
    ...Array(18).fill('none'),
  ] as any,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f8f9fa',
          fontSize: '14px',
          fontFamily: 'SegoeuiPc,Segoe UI,San Francisco,Helvetica Neue,Helvetica,Lucida Grande,Roboto,Ubuntu,Tahoma,Microsoft Sans Serif,Arial,sans-serif',
          overflowX: 'hidden',
          width: '100%',
          maxWidth: '100vw',
        },
        html: {
          overflowX: 'hidden',
          width: '100%',
          maxWidth: '100vw',
        },
        '#root': {
          overflowX: 'hidden',
          width: '100%',
          maxWidth: '100vw',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
          borderRadius: 0,
          border: '1px solid #e5e7eb',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.07), 0px 2px 4px rgba(0, 0, 0, 0.06)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '4px',
          padding: '8px 16px',
          fontSize: '0.875rem',
          fontFamily: 'SegoeuiPc,Segoe UI,San Francisco,Helvetica Neue,Helvetica,Lucida Grande,Roboto,Ubuntu,Tahoma,Microsoft Sans Serif,Arial,sans-serif',
          boxShadow: 'none',
        },
        contained: {
          '&.MuiButton-containedPrimary': {
            backgroundColor: '#4680ff',
            '&:hover': {
              backgroundColor: '#79a3ff',
              boxShadow: '0px 2px 4px rgba(70, 128, 255, 0.3)',
            },
            '&:active': {
              backgroundColor: '#0956ff',
            },
            '&:disabled': {
              backgroundColor: '#c3d5ff',
            },
          },
          '&.MuiButton-containedSuccess': {
            backgroundColor: '#93BE52',
            '&:hover': {
              backgroundColor: '#aacc77',
              boxShadow: '0px 2px 4px rgba(147, 190, 82, 0.3)',
            },
            '&:active': {
              backgroundColor: '#73993a',
            },
            '&:disabled': {
              backgroundColor: '#dce9c6',
            },
          },
          '&.MuiButton-containedWarning': {
            backgroundColor: '#FFB64D',
            '&:hover': {
              backgroundColor: '#ffcb80',
              boxShadow: '0px 2px 4px rgba(255, 182, 77, 0.3)',
            },
            '&:active': {
              backgroundColor: '#ff9d10',
            },
            '&:disabled': {
              backgroundColor: '#ffe7c4',
            },
          },
          '&.MuiButton-containedError': {
            backgroundColor: '#FC6180',
            '&:hover': {
              backgroundColor: '#fd93a8',
              boxShadow: '0px 2px 4px rgba(252, 97, 128, 0.3)',
            },
            '&:active': {
              backgroundColor: '#fb2550',
            },
            '&:disabled': {
              backgroundColor: '#fecbd5',
            },
          },
          '&.MuiButton-containedInfo': {
            backgroundColor: '#4680ff',
            '&:hover': {
              backgroundColor: '#79a3ff',
              boxShadow: '0px 2px 4px rgba(70, 128, 255, 0.3)',
            },
            '&:active': {
              backgroundColor: '#0956ff',
            },
            '&:disabled': {
              backgroundColor: '#c3d5ff',
            },
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&.MuiButton-outlinedPrimary': {
            borderColor: '#4680ff',
            color: '#4680ff',
            '&:hover': {
              borderColor: '#79a3ff',
              backgroundColor: 'rgba(70, 128, 255, 0.08)',
              color: '#79a3ff',
            },
            '&:active': {
              borderColor: '#0956ff',
              backgroundColor: 'rgba(9, 86, 255, 0.12)',
              color: '#0956ff',
            },
            '&:disabled': {
              borderColor: '#c3d5ff',
              color: '#c3d5ff',
            },
          },
          '&.MuiButton-outlinedSuccess': {
            borderColor: '#93BE52',
            color: '#93BE52',
            '&:hover': {
              borderColor: '#aacc77',
              backgroundColor: 'rgba(147, 190, 82, 0.08)',
              color: '#aacc77',
            },
            '&:active': {
              borderColor: '#73993a',
              backgroundColor: 'rgba(115, 153, 58, 0.12)',
              color: '#73993a',
            },
            '&:disabled': {
              borderColor: '#dce9c6',
              color: '#dce9c6',
            },
          },
          '&.MuiButton-outlinedWarning': {
            borderColor: '#FFB64D',
            color: '#FFB64D',
            '&:hover': {
              borderColor: '#ffcb80',
              backgroundColor: 'rgba(255, 182, 77, 0.08)',
              color: '#ffcb80',
            },
            '&:active': {
              borderColor: '#ff9d10',
              backgroundColor: 'rgba(255, 157, 16, 0.12)',
              color: '#ff9d10',
            },
            '&:disabled': {
              borderColor: '#ffe7c4',
              color: '#ffe7c4',
            },
          },
          '&.MuiButton-outlinedError': {
            borderColor: '#FC6180',
            color: '#FC6180',
            '&:hover': {
              borderColor: '#fd93a8',
              backgroundColor: 'rgba(252, 97, 128, 0.08)',
              color: '#fd93a8',
            },
            '&:active': {
              borderColor: '#fb2550',
              backgroundColor: 'rgba(251, 37, 80, 0.12)',
              color: '#fb2550',
            },
            '&:disabled': {
              borderColor: '#fecbd5',
              color: '#fecbd5',
            },
          },
          '&.MuiButton-outlinedInfo': {
            borderColor: '#4680ff',
            color: '#4680ff',
            '&:hover': {
              borderColor: '#79a3ff',
              backgroundColor: 'rgba(70, 128, 255, 0.08)',
              color: '#79a3ff',
            },
            '&:active': {
              borderColor: '#0956ff',
              backgroundColor: 'rgba(9, 86, 255, 0.12)',
              color: '#0956ff',
            },
            '&:disabled': {
              borderColor: '#c3d5ff',
              color: '#c3d5ff',
            },
          },
        },
        text: {
          '&.MuiButton-textPrimary': {
            color: '#4680ff',
            '&:hover': {
              backgroundColor: 'rgba(70, 128, 255, 0.08)',
              color: '#79a3ff',
            },
            '&:active': {
              backgroundColor: 'rgba(9, 86, 255, 0.12)',
              color: '#0956ff',
            },
            '&:disabled': {
              color: '#c3d5ff',
            },
          },
          '&.MuiButton-textSuccess': {
            color: '#93BE52',
            '&:hover': {
              backgroundColor: 'rgba(147, 190, 82, 0.08)',
              color: '#aacc77',
            },
            '&:active': {
              backgroundColor: 'rgba(115, 153, 58, 0.12)',
              color: '#73993a',
            },
            '&:disabled': {
              color: '#dce9c6',
            },
          },
          '&.MuiButton-textWarning': {
            color: '#FFB64D',
            '&:hover': {
              backgroundColor: 'rgba(255, 182, 77, 0.08)',
              color: '#ffcb80',
            },
            '&:active': {
              backgroundColor: 'rgba(255, 157, 16, 0.12)',
              color: '#ff9d10',
            },
            '&:disabled': {
              color: '#ffe7c4',
            },
          },
          '&.MuiButton-textError': {
            color: '#FC6180',
            '&:hover': {
              backgroundColor: 'rgba(252, 97, 128, 0.08)',
              color: '#fd93a8',
            },
            '&:active': {
              backgroundColor: 'rgba(251, 37, 80, 0.12)',
              color: '#fb2550',
            },
            '&:disabled': {
              color: '#fecbd5',
            },
          },
          '&.MuiButton-textInfo': {
            color: '#4680ff',
            '&:hover': {
              backgroundColor: 'rgba(70, 128, 255, 0.08)',
              color: '#79a3ff',
            },
            '&:active': {
              backgroundColor: 'rgba(9, 86, 255, 0.12)',
              color: '#0956ff',
            },
            '&:disabled': {
              color: '#c3d5ff',
            },
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 48,
          borderBottom: '1px solid #e0e0e0',
          '& .MuiTabs-indicator': {
            backgroundColor: '#4680ff',
            height: 2,
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
          fontFamily: 'SegoeuiPc,Segoe UI,San Francisco,Helvetica Neue,Helvetica,Lucida Grande,Roboto,Ubuntu,Tahoma,Microsoft Sans Serif,Arial,sans-serif',
          minHeight: 48,
          padding: '12px 16px',
          color: '#666666',
          '&:hover': {
            color: '#4680ff',
          },
          '&.Mui-selected': {
            color: '#4680ff',
            fontWeight: 600,
          },
          '&.Mui-disabled': {
            color: '#c3d5ff',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e5e7eb',
        },
        elevation0: {
          boxShadow: 'none',
          border: '1px solid #e5e7eb',
        },
        elevation1: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
        },
        elevation2: {
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.07), 0px 2px 4px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          border: '1px solid #d0d0d0',
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.08), 0px 1px 2px rgba(0, 0, 0, 0.04)',
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#f5f5f5',
          '& .MuiTableCell-head': {
            fontWeight: 600,
            fontSize: '0.875rem',
            color: '#333333',
            borderBottom: '1px solid #e0e0e0',
            padding: '12px 16px',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #e0e0e0',
          padding: '12px 16px',
          fontSize: '0.875rem',
          color: '#333333',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#e8f4f8',
          },
          '&:last-child td': {
            borderBottom: '1px solid #e0e0e0',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: 500,
          fontFamily: 'SegoeuiPc,Segoe UI,San Francisco,Helvetica Neue,Helvetica,Lucida Grande,Roboto,Ubuntu,Tahoma,Microsoft Sans Serif,Arial,sans-serif',
          height: '24px',
          '&.MuiChip-colorDefault': {
            backgroundColor: '#e0e0e0',
            color: '#333333',
          },
          '&.MuiChip-colorPrimary': {
            backgroundColor: '#4680ff',
            color: '#ffffff',
          },
          '&.MuiChip-colorSuccess': {
            backgroundColor: '#93BE52',
            color: '#ffffff',
          },
          '&.MuiChip-colorWarning': {
            backgroundColor: '#FFB64D',
            color: '#ffffff',
          },
          '&.MuiChip-colorError': {
            backgroundColor: '#FC6180',
            color: '#ffffff',
          },
          '&.MuiChip-colorInfo': {
            backgroundColor: '#4680ff',
            color: '#ffffff',
          },
        },
        outlined: {
          '&.MuiChip-outlinedDefault': {
            borderColor: '#e0e0e0',
            color: '#333333',
            backgroundColor: '#ffffff',
          },
          '&.MuiChip-outlinedPrimary': {
            borderColor: '#4680ff',
            color: '#4680ff',
            backgroundColor: '#ffffff',
          },
          '&.MuiChip-outlinedSuccess': {
            borderColor: '#93BE52',
            color: '#93BE52',
            backgroundColor: '#ffffff',
          },
          '&.MuiChip-outlinedWarning': {
            borderColor: '#FFB64D',
            color: '#FFB64D',
            backgroundColor: '#ffffff',
          },
          '&.MuiChip-outlinedError': {
            borderColor: '#FC6180',
            color: '#FC6180',
            backgroundColor: '#ffffff',
          },
          '&.MuiChip-outlinedInfo': {
            borderColor: '#4680ff',
            color: '#4680ff',
            backgroundColor: '#ffffff',
          },
        },
        sizeSmall: {
          height: '20px',
          fontSize: '0.6875rem',
        },
        sizeMedium: {
          height: '28px',
          fontSize: '0.8125rem',
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          borderRadius: '10px',
          fontSize: '0.6875rem',
          fontWeight: 600,
          fontFamily: 'SegoeuiPc,Segoe UI,San Francisco,Helvetica Neue,Helvetica,Lucida Grande,Roboto,Ubuntu,Tahoma,Microsoft Sans Serif,Arial,sans-serif',
          minWidth: '18px',
          height: '18px',
          padding: '0 6px',
        },
        colorPrimary: {
          backgroundColor: '#4680ff',
          color: '#ffffff',
        },
        colorSecondary: {
          backgroundColor: '#FC6180',
          color: '#ffffff',
        },
        colorError: {
          backgroundColor: '#FC6180',
          color: '#ffffff',
        },
        colorSuccess: {
          backgroundColor: '#93BE52',
          color: '#ffffff',
        },
        colorWarning: {
          backgroundColor: '#FFB64D',
          color: '#ffffff',
        },
        colorInfo: {
          backgroundColor: '#4680ff',
          color: '#ffffff',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 8,
          borderRadius: '4px',
          backgroundColor: '#e0e0e0',
          overflow: 'hidden',
        },
        bar: {
          borderRadius: '4px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontFamily: 'SegoeuiPc,Segoe UI,San Francisco,Helvetica Neue,Helvetica,Lucida Grande,Roboto,Ubuntu,Tahoma,Microsoft Sans Serif,Arial,sans-serif',
            '& fieldset': {
              borderColor: '#d0d0d0',
            },
            '&:hover fieldset': {
              borderColor: '#4680ff',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#4680ff',
              borderWidth: '1.5px',
            },
            '&.Mui-disabled': {
              backgroundColor: '#f5f5f5',
              '& fieldset': {
                borderColor: '#e0e0e0',
              },
            },
            '&.Mui-readOnly': {
              backgroundColor: '#f9f9f9',
              '& fieldset': {
                borderColor: '#e0e0e0',
              },
            },
          },
          '& .MuiInputLabel-root': {
            fontFamily: 'SegoeuiPc,Segoe UI,San Francisco,Helvetica Neue,Helvetica,Lucida Grande,Roboto,Ubuntu,Tahoma,Microsoft Sans Serif,Arial,sans-serif',
            fontSize: '0.875rem',
            '&.Mui-focused': {
              color: '#4680ff',
            },
          },
          '& .MuiInputBase-input': {
            fontFamily: 'SegoeuiPc,Segoe UI,San Francisco,Helvetica Neue,Helvetica,Lucida Grande,Roboto,Ubuntu,Tahoma,Microsoft Sans Serif,Arial,sans-serif',
            fontSize: '0.875rem',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          fontSize: '0.875rem',
          fontFamily: 'SegoeuiPc,Segoe UI,San Francisco,Helvetica Neue,Helvetica,Lucida Grande,Roboto,Ubuntu,Tahoma,Microsoft Sans Serif,Arial,sans-serif',
          '& fieldset': {
            borderColor: '#d0d0d0',
          },
          '&:hover fieldset': {
            borderColor: '#4680ff',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#4680ff',
            borderWidth: '1.5px',
          },
          '&.Mui-disabled': {
            backgroundColor: '#f5f5f5',
            '& fieldset': {
              borderColor: '#e0e0e0',
            },
          },
          '&.Mui-readOnly': {
            backgroundColor: '#f9f9f9',
            '& fieldset': {
              borderColor: '#e0e0e0',
            },
          },
        },
        input: {
          fontFamily: 'SegoeuiPc,Segoe UI,San Francisco,Helvetica Neue,Helvetica,Lucida Grande,Roboto,Ubuntu,Tahoma,Microsoft Sans Serif,Arial,sans-serif',
          fontSize: '0.875rem',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          boxShadow: '0px 20px 25px rgba(0, 0, 0, 0.1), 0px 10px 10px rgba(0, 0, 0, 0.04)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#ffffff',
          color: '#1a1a1a',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          fontSize: '0.875rem',
          fontFamily: 'SegoeuiPc,Segoe UI,San Francisco,Helvetica Neue,Helvetica,Lucida Grande,Roboto,Ubuntu,Tahoma,Microsoft Sans Serif,Arial,sans-serif',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#d0d0d0',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#4680ff',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#4680ff',
            borderWidth: '1.5px',
          },
          '&.Mui-disabled': {
            backgroundColor: '#f5f5f5',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#e0e0e0',
            },
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontFamily: 'SegoeuiPc,Segoe UI,San Francisco,Helvetica Neue,Helvetica,Lucida Grande,Roboto,Ubuntu,Tahoma,Microsoft Sans Serif,Arial,sans-serif',
          fontSize: '0.875rem',
        },
      },
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  // Theo dõi hoạt động người dùng và tự động logout sau 30 phút không hoạt động
  useInactivityTimer(360);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        autoHideDuration={3000}
        dense
      >
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/add" element={<ProjectAddEdit />} />
          <Route path="projects/edit/:id" element={<ProjectAddEdit />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="materials" element={<Navigate to="/materials/list" replace />} />
          <Route path="materials/list" element={<Materials tab="list" />} />
          <Route path="materials/add" element={<MaterialAddEdit />} />
          <Route path="materials/edit/:id" element={<MaterialAddEdit />} />
          <Route path="materials/transactions" element={<Materials tab="transactions" />} />
          <Route path="materials/transactions/add" element={<TransactionAddEdit />} />
          <Route path="materials/transactions/edit/:id" element={<TransactionAddEdit />} />
          <Route path="materials/purchase-requests" element={<Materials tab="purchase-requests" />} />
          <Route path="materials/purchase-requests/add" element={<PurchaseRequestAddEdit />} />
          <Route path="materials/purchase-requests/edit/:id" element={<PurchaseRequestAddEdit />} />
          <Route path="personnel" element={<Personnel />} />
          <Route path="personnel/add" element={<PersonnelAddEdit />} />
          <Route path="personnel/edit/:id" element={<PersonnelAddEdit />} />
          <Route path="roles" element={<Roles />} />
          <Route path="roles/add" element={<RolesAddEdit />} />
          <Route path="roles/edit/:id" element={<RolesAddEdit />} />
          <Route path="daily-reports" element={<DailyReports />} />
          <Route path="daily-reports/edit/:userId/:date" element={<DailyReportAddEdit />} />
          <Route path="daily-reports/view/:userId/:date" element={<DailyReportAddEdit />} />
          <Route path="group-chats" element={<GroupChats />} />
          <Route path="group-chats/:id" element={<GroupChats />} />
          <Route path="chats" element={<Chats />} />
          <Route path="chats/groups/:id" element={<Chats />} />
          <Route path="chats/direct/:conversationId" element={<Chats />} />
          <Route path="chats/direct/new/:userId" element={<Chats />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        </Routes>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;

