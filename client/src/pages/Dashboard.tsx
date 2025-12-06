import { useEffect } from 'react';
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Construction as ConstructionIcon,
} from '@mui/icons-material';
import { useDashboardStore } from '../stores/dashboardStore';
import soDoToChucImage from '../images/so_do_to_chuc.jpeg';

export default function Dashboard() {
  const { stats, isLoading, fetchStats } = useDashboardStore();

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
    bgColor,
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    bgColor?: string;
  }) => (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <CardContent 
        sx={{ 
          position: 'relative', 
          zIndex: 1,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '140px',
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ flex: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              color="text.secondary"
              gutterBottom
              variant="body2"
              sx={{ fontWeight: 500, mb: 1, fontSize: '0.875rem' }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                fontSize: '2rem',
                lineHeight: 1.2,
                mb: 0.5,
              }}
            >
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              color,
              fontSize: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: 0,
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
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6}>
          <StatCard
            title="Tổng dự án"
            value={stats.totalProjects}
            icon={<ConstructionIcon />}
            color="#1976d2"
            bgColor="linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatCard
            title="Dự án đang triển khai"
            value={stats.activeProjects}
            icon={<ConstructionIcon />}
            color="#10b981"
            bgColor="linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)"
          />
        </Grid>
        <Grid item xs={12}>
          <Card
            sx={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  color: 'text.primary',
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
                }}
              >
                <img
                  src={soDoToChucImage}
                  alt="Sơ đồ tổ chức"
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    display: 'block',
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

