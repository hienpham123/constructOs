import { useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Construction as ConstructionIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  Build as BuildIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useDashboardStore } from '../stores/dashboardStore';
import { formatDate } from '../utils/dateFormat';
import MonthlyChart from '../components/charts/MonthlyChart';

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
        background: bgColor || `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}20`,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100px',
          height: '100px',
          background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
          borderRadius: '50%',
          transform: 'translate(30%, -30%)',
        },
      }}
    >
      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
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
              fontSize: 48,
              opacity: 0.9,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
              border: `1px solid ${color}30`,
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
            title="Thiết bị đang sử dụng"
            value={`${stats.equipmentInUse}/${stats.totalEquipment}`}
            icon={<BuildIcon />}
            color="#8b5cf6"
            bgColor="linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)"
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

      {stats.alerts.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Paper
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              border: '1px solid #fbbf2420',
            }}
          >
            <Box display="flex" alignItems="center" mb={2}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  backgroundColor: 'warning.main',
                  color: 'white',
                  mr: 2,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <WarningIcon />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Cảnh báo
              </Typography>
            </Box>
            <List sx={{ pt: 0 }}>
              {stats.alerts.map((alert) => (
                <Alert
                  key={alert.id}
                  severity={alert.type === 'error' ? 'error' : alert.type === 'warning' ? 'warning' : 'info'}
                  sx={{
                    mb: 1.5,
                    borderRadius: 2,
                    '&:last-child': { mb: 0 },
                  }}
                >
                  <AlertTitle sx={{ fontWeight: 600 }}>{alert.title}</AlertTitle>
                  {alert.message}
                </Alert>
              ))}
            </List>
          </Paper>
        </Box>
      )}

      {/* Lịch bảo trì sắp tới */}
      {stats.upcomingMaintenance.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Paper
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
              border: '1px solid #8b5cf620',
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}
            >
              <BuildIcon sx={{ mr: 1.5, color: 'primary.main' }} />
              Lịch bảo trì sắp tới
            </Typography>
            <List sx={{ pt: 0 }}>
              {stats.upcomingMaintenance.map((maintenance) => (
                <ListItem
                  key={maintenance.id}
                  sx={{
                    mb: 1.5,
                    backgroundColor: 'white',
                    borderRadius: 2,
                    border: '1px solid rgba(139, 92, 246, 0.1)',
                    '&:last-child': { mb: 0 },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {maintenance.equipmentName}
                      </Typography>
                    }
                    secondary={`${formatDate(maintenance.scheduledDate)} - ${maintenance.description}`}
                  />
                  <Chip
                    label={maintenance.status === 'scheduled' ? 'Đã lên lịch' : maintenance.status}
                    color={maintenance.status === 'scheduled' ? 'primary' : 'default'}
                    size="small"
                    sx={{ fontWeight: 500 }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>
      )}

      {/* Monthly Charts Section */}
      <Box sx={{ mt: 4 }}>
        <MonthlyChart />
      </Box>
    </Box>
  );
}

