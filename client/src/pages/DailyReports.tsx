import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/vi';
import dayjs from 'dayjs';
import { dailyReportsAPI } from '../services/api';
import { formatDateTime } from '../utils/dateFormat';
import { useAuthStore } from '../stores/authStore';
import { DataTable } from '../components/common';

interface DailyReport {
  id?: string;
  user_id: string;
  user_name: string;
  user_code?: string;
  has_report: boolean;
  report: {
    id: string;
    content: string;
    suggestion?: string;
    report_date: string;
    created_at: string;
    updated_at: string;
  } | null;
}

export default function DailyReports() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs());

  useEffect(() => {
    fetchReports();
  }, [selectedDate]);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const dateStr = selectedDate.format('YYYY-MM-DD');
      const response = await dailyReportsAPI.getReports({
        date: dateStr,
        pageSize: 1000, // Get all users
      });
      setReports(response.data || []);
    } catch (error: any) {
      console.error('Error fetching daily reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  // Transform reports data for DataTable
  const tableData = reports.map((report, index) => ({
    id: report.user_id,
    index: index + 1,
    user_name: report.user_name,
    content: report.report?.content || '-',
    suggestion: report.report?.suggestion || '-',
    has_report: report.has_report,
    created_at: report.report?.created_at || null,
    report_date: report.report?.report_date || selectedDate.format('YYYY-MM-DD'),
    user_id: report.user_id,
    report: report.report,
  }));

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Báo cáo ngày
          </Typography>
        </Box>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="body1" sx={{ minWidth: 100 }}>
              Lọc theo ngày:
            </Typography>
            <DatePicker
              label="Chọn ngày"
              value={selectedDate}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  variant: 'outlined',
                  size: 'small',
                },
              }}
            />
          </Box>
        </Paper>

        {isLoading ? (
          <LinearProgress />
        ) : (
          <DataTable
            columns={[
              {
                label: 'STT',
                field: 'index',
                width: 60,
                align: 'center',
              },
              {
                label: 'Nhân viên',
                field: 'user_name',
                minWidth: 150,
              },
              {
                label: 'Trạng thái báo cáo',
                field: 'has_report',
                width: 120,
                align: 'center',
                render: (value: boolean) => (
                  value ? (
                    <Tooltip title="Đã báo cáo">
                      <CheckCircleIcon color="success" />
                    </Tooltip>
                  ) : (
                    <Tooltip title="Chưa báo cáo">
                      <RadioButtonUncheckedIcon color="disabled" />
                    </Tooltip>
                  )
                ),
              },
              {
                label: 'Thời gian báo cáo',
                field: 'created_at',
                width: 150,
                render: (value: string | null) => (
                  value ? (
                    <Typography variant="body2">
                      {formatDateTime(value, 'DD/MM/YYYY HH:mm')}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">-</Typography>
                  )
                ),
              },
              {
                label: 'Nội dung báo cáo',
                field: 'content',
                minWidth: 300,
                render: (value: string) => (
                  <Typography
                    variant="body2"
                    sx={{
                      maxWidth: 400,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {value}
                  </Typography>
                ),
              },
              {
                label: 'Đề xuất',
                field: 'suggestion',
                minWidth: 300,
                render: (value: string) => (
                  <Typography
                    variant="body2"
                    sx={{
                      maxWidth: 400,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {value}
                  </Typography>
                ),
              },
            ]}
            data={tableData}
            actions={{
              onView: () => {}, // Use customActions instead
              onEdit: () => {}, // Use customActions instead
              onDelete: () => {}, // Required but not used (no delete action)
              customActions: (row: any) => {
                const actions: any[] = [];
                const isCurrentUser = row.user_id === user?.id;
                
                // Show "Xem báo cáo" for all reports that exist
                if (row.report) {
                  const viewDate = dayjs(row.report_date).format('YYYY-MM-DD');
                  actions.push({
                    label: 'Xem báo cáo',
                    icon: <VisibilityIcon />,
                    onClick: () => navigate(`/daily-reports/view/${row.user_id}/${viewDate}`),
                    color: 'info' as const,
                  });
                }
                
                // Only show "Chỉnh sửa" for current user's own reports and only for today's reports
                if (isCurrentUser) {
                  const reportDate = row.report_date ? dayjs(row.report_date) : selectedDate;
                  const isToday = reportDate.isSame(dayjs(), 'day');
                  
                  // Only allow editing today's reports, not past dates
                  if (isToday) {
                    const editDate = reportDate.format('YYYY-MM-DD');
                    actions.push({
                      label: 'Chỉnh sửa',
                      icon: <EditIcon />,
                      onClick: () => navigate(`/daily-reports/edit/${row.user_id}/${editDate}`),
                      color: 'primary' as const,
                    });
                  }
                }
                
                // Return empty array if no actions (will show nothing)
                return actions;
              },
            }}
            emptyMessage="Không có dữ liệu. Vui lòng chọn ngày khác hoặc tạo báo cáo mới."
            minWidth={1200}
          />
        )}
      </Box>
    </LocalizationProvider>
  );
}
