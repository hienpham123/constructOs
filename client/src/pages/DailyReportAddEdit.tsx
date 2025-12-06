import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  TextField,
  Paper,
  Typography,
  Breadcrumbs,
  Link,
  CircularProgress,
} from '@mui/material';
import { Button } from '../components/common';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/vi';
import dayjs from 'dayjs';
import { dailyReportsAPI } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { showSuccess, showError } from '../utils/notifications';
import HomeIcon from '@mui/icons-material/Home';
import SaveIcon from '@mui/icons-material/Save';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

const dailyReportSchema = z.object({
  content: z.string().min(1, 'Nội dung báo cáo là bắt buộc'),
  suggestion: z.string().optional(),
  reportDate: z.any(),
});

type DailyReportFormData = z.infer<typeof dailyReportSchema>;

export default function DailyReportAddEdit() {
  const { userId, date } = useParams<{ userId: string; date: string }>();
  const navigate = useNavigate();
  const location = window.location.pathname;
  const isViewMode = location.includes('/view/');
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [reportExists, setReportExists] = useState<boolean | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DailyReportFormData>({
    resolver: zodResolver(dailyReportSchema),
    defaultValues: {
      content: '',
      suggestion: '',
      reportDate: date ? dayjs(date).isValid() ? dayjs(date) : dayjs() : dayjs(),
    },
  });

  useEffect(() => {
    if (userId && date) {
      // Parse date from URL (could be ISO string or YYYY-MM-DD)
      const parsedDate = dayjs(date).format('YYYY-MM-DD');
      
      // Allow viewing any report, but only editing own reports
      if (isViewMode || user?.id === userId) {
        fetchReport(parsedDate);
      } else if (!isViewMode) {
        // If trying to edit someone else's report, redirect to view mode
        navigate(`/daily-reports/view/${userId}/${parsedDate}`, { replace: true });
      }
    } else if (user?.id && !isViewMode) {
      // If no userId/date in params, use current user and today
      if (!userId) {
        navigate(`/daily-reports/edit/${user.id}/${dayjs().format('YYYY-MM-DD')}`, { replace: true });
      }
    }
  }, [userId, date, user, isViewMode]);

  const fetchReport = async (dateStr?: string) => {
    try {
      setFetching(true);
      // Use provided dateStr or parse from URL param
      const reportDate = dateStr || (date ? dayjs(date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'));
      const report = await dailyReportsAPI.getReportByUserAndDate(userId!, reportDate);
      // Report exists, populate form
      setReportExists(true);
      reset({
        content: report.content || '',
        suggestion: report.suggestion || '',
        reportDate: dayjs(report.report_date),
      });
    } catch (error: any) {
      // If report doesn't exist (404), that's okay - we're creating a new one
      if (error.response?.status === 404) {
        setReportExists(false);
        // Report doesn't exist yet, set form with date from URL for creating new report
        const reportDate = dateStr || (date ? dayjs(date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'));
        reset({
          content: '',
          suggestion: '',
          reportDate: dayjs(reportDate),
        });
      } else {
        // Other errors
        setReportExists(null);
        console.error('Error fetching report:', error);
      }
    } finally {
      setFetching(false);
    }
  };

  const onSubmit = async (data: DailyReportFormData) => {
    if (!user?.id) {
      showError('Vui lòng đăng nhập');
      return;
    }

    // Only allow editing own reports
    if (userId && userId !== user.id) {
      showError('Bạn chỉ có thể chỉnh sửa báo cáo của chính mình');
      return;
    }

    try {
      setLoading(true);
      const reportDate = data.reportDate.format('YYYY-MM-DD');
      await dailyReportsAPI.createOrUpdateReport(user.id, reportDate, {
        content: data.content.trim(),
        suggestion: data.suggestion?.trim() || undefined,
      });
      showSuccess('Lưu báo cáo thành công');
      navigate('/daily-reports');
    } catch (error: any) {
      console.error('Error saving report:', error);
      showError(error.response?.data?.error || 'Không thể lưu báo cáo');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      <Box>
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link
            color="inherit"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <HomeIcon fontSize="small" />
            Trang chủ
          </Link>
          <Link
            color="inherit"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate('/daily-reports');
            }}
          >
            Báo cáo ngày
          </Link>
          <Typography color="text.primary">
            {isViewMode ? 'Xem báo cáo' : userId && date ? 'Chỉnh sửa báo cáo' : 'Tạo báo cáo'}
          </Typography>
        </Breadcrumbs>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
            {isViewMode ? 'Xem báo cáo ngày' : userId && date ? 'Chỉnh sửa báo cáo ngày' : 'Tạo báo cáo ngày'}
          </Typography>

          {fetching ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : isViewMode && reportExists === false ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                Chưa có báo cáo cho ngày này
              </Typography>
              <Button
                variant="outlined"
                startIcon={<ExitToAppIcon />}
                onClick={() => navigate('/daily-reports')}
              >
                Quay lại
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {/* Buttons at the top */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, justifyContent: 'flex-end' }}>
              {!isViewMode && (
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={loading}
                >
                  {loading ? 'Đang lưu...' : 'Lưu'}
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<ExitToAppIcon />}
                onClick={() => navigate('/daily-reports')}
                disabled={loading}
              >
                Quay lại
              </Button>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Controller
                name="reportDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Ngày báo cáo *"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isViewMode}
                    slotProps={{
                      textField: {
                        variant: 'outlined',
                        fullWidth: true,
                        error: !!errors.reportDate,
                        helperText: errors.reportDate?.message as string,
                      },
                    }}
                  />
                )}
              />

              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nội dung báo cáo *"
                    multiline
                    rows={8}
                    fullWidth
                    variant="outlined"
                    disabled={isViewMode}
                    error={!!errors.content}
                    helperText={errors.content?.message}
                  />
                )}
              />

              <Controller
                name="suggestion"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Đề xuất"
                    multiline
                    rows={6}
                    fullWidth
                    variant="outlined"
                    disabled={isViewMode}
                    error={!!errors.suggestion}
                    helperText={errors.suggestion?.message}
                  />
                )}
              />

            </Box>
          </Box>
          )}
        </Paper>
      </Box>
    </LocalizationProvider>
  );
}

