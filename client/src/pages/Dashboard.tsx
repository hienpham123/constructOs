import { useEffect } from 'react';
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  Avatar,
  Divider,
  Chip,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHardHat, faChartLine, faUsers, faBox, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { useDashboardStore } from '../stores/dashboardStore';
import { useAuthStore } from '../stores/authStore';
import soDoToChucImage from '../images/so_do_to_chuc.jpeg';

export default function Dashboard() {
  const { stats, isLoading, fetchStats } = useDashboardStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoading) {
    return <LinearProgress />;
  }

  if (!stats) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Dashboard Tổng quan
        </Typography>
        <Alert severity="info">Đang tải dữ liệu...</Alert>
      </Box>
    );
  }

  const StatCard = ({
    title,
    value,
    icon,
    color,
    change,
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    change?: string;
  }) => (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      <CardContent 
        sx={{ 
          position: 'relative', 
          zIndex: 1,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          p: 2.5,
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              color="text.secondary"
              variant="body2"
              sx={{ 
                fontWeight: 500, 
                fontSize: '0.875rem',
                mb: 1,
                color: '#6b7280',
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#1a1a1a',
                fontSize: '1.75rem',
                lineHeight: 1.2,
                mb: change ? 0.5 : 0,
              }}
            >
              {value}
            </Typography>
            {change && (
              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.8125rem',
                  color: '#10b981',
                  fontWeight: 500,
                  mt: 0.5,
                }}
              >
                {change}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '4px',
              background: `${color}15`,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          mb: 3,
          color: '#1a1a1a',
          fontSize: '1.5rem',
        }}
      >
        Dashboard Analytics
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng dự án"
            value={stats.totalProjects}
            icon={<FontAwesomeIcon icon={faHardHat} style={{ fontSize: '18px', fontWeight: 'lighter' }} />}
            color="#4680ff"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Dự án đang triển khai"
            value={stats.activeProjects}
            icon={<FontAwesomeIcon icon={faChartLine} style={{ fontSize: '18px', fontWeight: 'lighter' }} />}
            color="#93BE52"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng nhân sự"
            value={stats.totalPersonnel || 0}
            icon={<FontAwesomeIcon icon={faUsers} style={{ fontSize: '18px', fontWeight: 'lighter' }} />}
            color="#FFB64D"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Vật tư thiếu"
            value={stats.lowStockMaterials || 0}
            icon={<FontAwesomeIcon icon={faBox} style={{ fontSize: '18px', fontWeight: 'lighter' }} />}
            color="#FC6180"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              background: '#ffffff',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
              height: '100%',
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                  <Box
                    sx={{
                      position: 'relative',
                      display: 'inline-block',
                      mb: 2,
                    }}
                  >
                    <Avatar
                      src={user?.avatar || undefined}
                      sx={{
                        width: 100,
                        height: 100,
                        bgcolor: '#1877f2',
                        fontSize: '2.5rem',
                        fontWeight: 600,
                        border: '4px solid #9c27b0',
                      }}
                    >
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </Avatar>
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      fontSize: '1.25rem',
                      color: '#1a1a1a',
                      mb: 1,
                    }}
                  >
                    {user?.name || 'Người dùng'}
                  </Typography>
                  <Chip
                    label={user?.role_description}
                    sx={{
                      bgcolor: '#e4e6eb',
                      color: '#65676b',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      height: '28px',
                      mb: 2,
                    }}
                  />
                  
                  <Divider sx={{ width: '100%', my: 1.5 }} />
                  
                  <Box sx={{ width: '100%', textAlign: 'left' }}>
                    {user?.email && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <FontAwesomeIcon 
                          icon={faEnvelope} 
                          style={{ 
                            fontSize: '12px', 
                            color: '#65676b',
                            marginRight: '8px',
                            width: '16px',
                            fontWeight: 'lighter',
                          }} 
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#65676b',
                            fontSize: '0.875rem',
                          }}
                        >
                          {user.email}
                        </Typography>
                      </Box>
                    )}
                    {user?.phone && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <FontAwesomeIcon 
                          icon={faPhone} 
                          style={{ 
                            fontSize: '12px', 
                            color: '#65676b',
                            marginRight: '8px',
                            width: '16px',
                            fontWeight: 'lighter',
                          }} 
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#65676b',
                            fontSize: '0.875rem',
                          }}
                        >
                          {user.phone}
                        </Typography>
                      </Box>
                    )}
                    {user?.status && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#65676b',
                            fontSize: '0.875rem',
                          }}
                        >
                          Trạng thái: {user.status === 'active' ? 'Đang hoạt động' : user.status}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              background: '#ffffff',
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
              height: '100%',
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  color: '#1a1a1a',
                  fontSize: '1.125rem',
                }}
              >
                Sơ đồ tổ chức
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '100%',
                  overflow: 'auto',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  p: 2,
                }}
              >
                <img
                  src={soDoToChucImage}
                  alt="Sơ đồ tổ chức"
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    display: 'block',
                    borderRadius: '4px',
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

