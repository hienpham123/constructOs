import { useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dayjs } from 'dayjs';
import dayjs from '../../config/dayjs';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Autocomplete,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/vi';
import { SiteLog } from '../../types';
import { useProjectStore } from '../../stores/projectStore';
import { useAuthStore } from '../../stores/authStore';
import { showError } from '../../utils/notifications';

const siteLogSchema = z.object({
  projectId: z.string().min(1, 'Dự án là bắt buộc'),
  date: z.any().refine((val) => val !== null && val !== undefined, {
    message: 'Ngày là bắt buộc',
  }),
  weather: z.string().min(1, 'Thời tiết là bắt buộc'),
  workDescription: z.string().min(1, 'Mô tả công việc là bắt buộc'),
  issues: z.string().optional(),
});

type SiteLogFormData = z.infer<typeof siteLogSchema>;

interface SiteLogFormProps {
  open: boolean;
  onClose: () => void;
  siteLog?: SiteLog | null;
}

export default function SiteLogForm({ open, onClose, siteLog }: SiteLogFormProps) {
  const { addSiteLog, projects, fetchProjects } = useProjectStore();
  const { user } = useAuthStore();
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (open) {
      fetchProjects();
    }
  }, [open, fetchProjects]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SiteLogFormData>({
    resolver: zodResolver(siteLogSchema),
    defaultValues: {
      projectId: '',
      date: dayjs(),
      weather: '',
      workDescription: '',
      issues: '',
    },
  });

  useEffect(() => {
    if (!open) {
      isSubmittingRef.current = false;
      return;
    }

    if (siteLog) {
      reset({
        projectId: siteLog.projectId || '',
        date: siteLog.date ? dayjs(siteLog.date) : dayjs(),
        weather: siteLog.weather || '',
        workDescription: siteLog.workDescription || '',
        issues: siteLog.issues || '',
      });
    } else {
      reset({
        projectId: '',
        date: dayjs(),
        weather: '',
        workDescription: '',
        issues: '',
      });
    }
  }, [siteLog?.id, open, reset]);

  const onSubmit = async (data: SiteLogFormData) => {
    if (isSubmittingRef.current || isSubmitting) {
      return;
    }

    isSubmittingRef.current = true;

    try {
      const siteLogData = {
        projectId: data.projectId,
        date: data.date ? dayjs(data.date).format('YYYY-MM-DD') : '',
        weather: data.weather,
        workDescription: data.workDescription,
        issues: data.issues || '',
        photos: siteLog?.photos || [],
      };

      await addSiteLog(siteLogData);
      onClose();
    } catch (error: any) {
      console.error('Error saving site log:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Không thể lưu nhật ký công trường';
      showError(errorMessage);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{siteLog ? 'Chỉnh sửa nhật ký công trường' : 'Thêm nhật ký công trường mới'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="projectId"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={projects}
                      getOptionLabel={(option) => option ? `${option.code} - ${option.name}` : ''}
                      value={projects.find((p) => p.id === field.value) || null}
                      onChange={(_, newValue) => field.onChange(newValue?.id || '')}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Dự án"
                          placeholder="Tìm kiếm dự án..."
                          required
                          error={!!errors.projectId}
                          helperText={errors.projectId?.message}
                        />
                      )}
                      filterOptions={(options, { inputValue }) => {
                        const searchValue = inputValue.toLowerCase();
                        return options.filter(
                          (option) =>
                            option.code.toLowerCase().includes(searchValue) ||
                            option.name.toLowerCase().includes(searchValue)
                        );
                      }}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label="Ngày"
                      format="DD/MM/YYYY"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.date,
                          helperText: errors.date?.message as string,
                          required: true,
                        },
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="weather"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Thời tiết"
                      error={!!errors.weather}
                      helperText={errors.weather?.message}
                      required
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="workDescription"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Mô tả công việc"
                      multiline
                      rows={4}
                      error={!!errors.workDescription}
                      helperText={errors.workDescription?.message}
                      required
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="issues"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Vấn đề / Ghi chú"
                      multiline
                      rows={3}
                      error={!!errors.issues}
                      helperText={errors.issues?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Hủy</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {siteLog ? 'Cập nhật' : 'Thêm'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </LocalizationProvider>
  );
}

