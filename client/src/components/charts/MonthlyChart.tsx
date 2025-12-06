import { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { dashboardAPI } from '../../services/api';
import moment from 'moment';

interface MonthlyData {
  date: string;
  day: number;
  revenue: number;
  projects: number;
  personnel: number;
  siteLogs: number;
}

interface MonthlyStats {
  monthlyData: MonthlyData[];
  last12Months: Array<{
    month: string;
    monthName: string;
    revenue: number;
    projects: number;
  }>;
  summary: {
    totalRevenue: number;
    totalProjects: number;
    totalPersonnel: number;
    totalSiteLogs: number;
  };
}

export default function MonthlyChart() {
  const [year, setYear] = useState<number>(moment().year());
  const [month, setMonth] = useState<number>(moment().month() + 1);
  const [data, setData] = useState<MonthlyStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [year, month]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const result = await dashboardAPI.getMonthlyStats(year, month);
      setData(result);
    } catch (error) {
      console.error('Error fetching monthly stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  const formatCurrencyFull = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  // Generate years list (current year and 2 years before)
  const years = [];
  for (let i = moment().year(); i >= moment().year() - 2; i--) {
    years.push(i);
  }

  // Generate months list
  const months = [
    { value: 1, label: 'Tháng 1' },
    { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' },
    { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' },
    { value: 6, label: 'Tháng 6' },
    { value: 7, label: 'Tháng 7' },
    { value: 8, label: 'Tháng 8' },
    { value: 9, label: 'Tháng 9' },
    { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' },
    { value: 12, label: 'Tháng 12' },
  ];

  if (isLoading) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography>Đang tải dữ liệu...</Typography>
      </Paper>
    );
  }

  if (!data) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography>Không có dữ liệu</Typography>
      </Paper>
    );
  }

  // Format data for charts
  const dailyData = data.monthlyData.map((item) => ({
    day: `Ngày ${item.day}`,
    date: moment(item.date).format('DD/MM'),
    revenue: item.revenue,
    projects: item.projects,
    personnel: item.personnel,
    siteLogs: item.siteLogs,
  }));

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6">Thống kê theo tháng</Typography>
          <Box display="flex" gap={2}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Năm</InputLabel>
              <Select
                value={year}
                label="Năm"
                onChange={(e) => setYear(Number(e.target.value))}
              >
                {years.map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Tháng</InputLabel>
              <Select
                value={month}
                label="Tháng"
                onChange={(e) => setMonth(Number(e.target.value))}
              >
                {months.map((m) => (
                  <MenuItem key={m.value} value={m.value}>
                    {m.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, bgcolor: '#e3f2fd' }}>
              <Typography variant="body2" color="textSecondary">
                Tổng doanh thu
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {formatCurrencyFull(data.summary.totalRevenue)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, bgcolor: '#f1f8e9' }}>
              <Typography variant="body2" color="textSecondary">
                Tổng dự án
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {data.summary.totalProjects}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, bgcolor: '#fff3e0' }}>
              <Typography variant="body2" color="textSecondary">
                Tổng nhân sự
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {data.summary.totalPersonnel}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, bgcolor: '#fce4ec' }}>
              <Typography variant="body2" color="textSecondary">
                Tổng nhật ký
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {data.summary.totalSiteLogs}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Daily Revenue Chart */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Doanh thu theo ngày trong tháng
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrencyFull(value)}
                labelFormatter={(label) => `Ngày: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#1976d2" 
                strokeWidth={2}
                name="Doanh thu"
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {/* Daily Activities Chart */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Hoạt động theo ngày trong tháng
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(label) => `Ngày: ${label}`}
              />
              <Legend />
              <Bar dataKey="projects" fill="#2e7d32" name="Dự án" />
              <Bar dataKey="personnel" fill="#ed6c02" name="Nhân sự" />
              <Bar dataKey="siteLogs" fill="#9c27b0" name="Nhật ký" />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* Last 12 Months Revenue */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Doanh thu 12 tháng gần đây
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.last12Months}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="monthName" 
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrencyFull(value)}
                labelFormatter={(label) => `Tháng: ${label}`}
              />
              <Legend />
              <Bar dataKey="revenue" fill="#1976d2" name="Doanh thu" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
    </Box>
  );
}

