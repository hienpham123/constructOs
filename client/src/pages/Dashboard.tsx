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
  Inventory as InventoryIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useDashboardStore } from '../stores/dashboardStore';

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

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
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 1,
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Dashboard Tổng quan
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tổng quan về hoạt động và hiệu suất của công ty
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng dự án"
            value={stats.totalProjects}
            icon={<ConstructionIcon />}
            color="#1976d2"
            bgColor="linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Dự án đang thi công"
            value={stats.activeProjects}
            icon={<ConstructionIcon />}
            color="#10b981"
            bgColor="linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng doanh thu"
            value={formatCurrency(stats.totalRevenue)}
            icon={<TrendingUpIcon />}
            color="#f59e0b"
            bgColor="linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Lợi nhuận"
            value={formatCurrency(stats.totalProfit)}
            icon={<TrendingUpIcon />}
            color="#10b981"
            bgColor="linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng nhân sự"
            value={stats.totalPersonnel}
            icon={<PeopleIcon />}
            color="#3b82f6"
            bgColor="linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Nhân sự đang làm"
            value={stats.activePersonnel}
            icon={<PeopleIcon />}
            color="#10b981"
            bgColor="linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Vật tư sắp hết"
            value={stats.lowStockMaterials}
            icon={<InventoryIcon />}
            color="#ef4444"
            bgColor="linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)"
          />
        </Grid>
      </Grid>
    </Box>
  );
}

