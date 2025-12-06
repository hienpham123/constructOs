import { useEffect, useRef, useState } from 'react';
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
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/vi';
import { Project } from '../../types';
import { useProjectStore } from '../../stores/projectStore';
import { useAuthStore } from '../../stores/authStore';
import { formatCurrencyInput, parseCurrencyInput } from '../../utils/currencyFormat';
import { normalizeNumber } from '../../utils/normalize';

const projectSchema = z.object({
  name: z.string().min(1, 'Tên dự án là bắt buộc'),
  code: z.string().min(1, 'Mã dự án là bắt buộc'),
  description: z.string().optional(),
  client: z.string().min(1, 'Khách hàng là bắt buộc'),
  location: z.string().min(1, 'Địa điểm là bắt buộc'),
  startDate: z.any().refine((val) => val !== null && val !== undefined, {
    message: 'Ngày bắt đầu là bắt buộc',
  }),
  endDate: z.any().refine((val) => val !== null && val !== undefined, {
    message: 'Ngày kết thúc là bắt buộc',
  }),
  budget: z.number().min(0, 'Ngân sách phải >= 0'),
  status: z.enum(['planning', 'in_progress', 'on_hold', 'completed', 'cancelled']),
  progress: z.number().min(0).max(100, 'Tiến độ phải từ 0-100'),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  open: boolean;
  onClose: () => void;
  project?: Project | null;
}

export default function ProjectForm({ open, onClose, project }: ProjectFormProps) {
  const { addProject, updateProject } = useProjectStore();
  const { user } = useAuthStore();
  const isSubmittingRef = useRef(false);
  const [autoCalculateProgress, setAutoCalculateProgress] = useState(false);
  
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      client: '',
      location: '',
      startDate: null,
      endDate: null,
      budget: 0,
      status: 'planning',
      progress: 0,
    },
  });

  // Tính progress tự động từ stages
  const calculateProgressFromStages = (stages: any[]): number => {
    if (!stages || stages.length === 0) {
      return 0;
    }
    const completedStages = stages.filter((stage) => stage.status === 'completed').length;
    return Math.round((completedStages / stages.length) * 100);
  };

  useEffect(() => {
    if (!open) {
      // Reset submitting flag when dialog closes
      isSubmittingRef.current = false;
      setAutoCalculateProgress(false);
      return;
    }
    
    if (project) {
      // Convert date from ISO string to Dayjs object for DatePicker
      const parseDate = (dateString: string | undefined | null): Dayjs | null => {
        if (!dateString) return null;
        const date = dateString;
        if (!date) return null;
        return dayjs(date);
      };

      const stages = project.stages || [];
      const hasStages = stages.length > 0;
      const shouldAutoCalculate = hasStages;
      
      setAutoCalculateProgress(shouldAutoCalculate);
      
      const calculatedProgress = hasStages 
        ? calculateProgressFromStages(stages)
        : (project.progress || (project as any).progress || 0);

      reset({
        name: project.name || '',
        code: project.code || '',
        description: project.description || '',
        client: project.client || '',
        location: project.location || '',
        startDate: parseDate(project.startDate || (project as any).start_date),
        endDate: parseDate(project.endDate || (project as any).end_date),
        budget: normalizeNumber(project.budget || (project as any).budget),
        status: project.status || 'planning',
        progress: calculatedProgress,
      });
    } else {
      reset({
        name: '',
        code: '',
        description: '',
        client: '',
        location: '',
        startDate: null,
        endDate: null,
        budget: 0,
        status: 'planning',
        progress: 0,
      });
      setAutoCalculateProgress(false);
    }
  }, [project?.id, open, reset]); // Include reset but it's stable from react-hook-form

  // Tính lại progress khi stages thay đổi (nếu đang ở chế độ tự động)
  useEffect(() => {
    if (autoCalculateProgress && project?.stages) {
      const calculatedProgress = calculateProgressFromStages(project.stages);
      setValue('progress', calculatedProgress);
    }
  }, [project?.stages, autoCalculateProgress, setValue]);

  const onSubmit = async (data: ProjectFormData) => {
    // Prevent duplicate submission
    if (isSubmittingRef.current || isSubmitting) {
      return;
    }
    
    isSubmittingRef.current = true;
    
    try {
      const projectData = {
        name: data.name,
        code: data.code,
        description: data.description || '',
        client: data.client,
        location: data.location,
        startDate: data.startDate ? dayjs(data.startDate).format('YYYY-MM-DD') : '',
        endDate: data.endDate ? dayjs(data.endDate).format('YYYY-MM-DD') : '',
        budget: data.budget,
        actualCost: project?.actualCost || 0,
        progress: data.progress || 0,
        managerId: user?.id || '',
        managerName: user?.name || '',
        status: data.status,
      };

      if (project) {
        await updateProject(project.id, projectData);
      } else {
        await addProject(projectData);
      }
      isSubmittingRef.current = false;
      onClose();
    } catch (error: any) {
      console.error('Error saving project:', error);
      // Error notification đã được xử lý bởi API interceptor
      isSubmittingRef.current = false;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{project ? 'Chỉnh sửa dự án' : 'Thêm dự án mới'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="code"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Mã dự án"
                      error={!!errors.code}
                      helperText={errors.code?.message}
                      required
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Tên dự án"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      required
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Mô tả"
                      multiline
                      rows={3}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="client"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Khách hàng"
                      error={!!errors.client}
                      helperText={errors.client?.message}
                      required
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="location"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Địa điểm"
                      error={!!errors.location}
                      helperText={errors.location?.message}
                      required
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="startDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label="Ngày bắt đầu"
                      format="DD/MM/YYYY"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.startDate,
                          helperText: errors.startDate?.message as string,
                          required: true,
                        },
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label="Ngày kết thúc"
                      format="DD/MM/YYYY"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.endDate,
                          helperText: errors.endDate?.message as string,
                          required: true,
                        },
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="budget"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      label="Ngân sách (VND)"
                      error={!!errors.budget}
                      helperText={errors.budget?.message}
                      required
                      value={formatCurrencyInput(field.value)}
                      onChange={(e) => {
                        const parsed = parseCurrencyInput(e.target.value);
                        field.onChange(parsed);
                      }}
                      onBlur={field.onBlur}
                      inputProps={{
                        inputMode: 'numeric',
                        pattern: '[0-9,]*',
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Trạng thái</InputLabel>
                      <Select
                        {...field}
                        label="Trạng thái"
                      >
                        <MenuItem value="planning">Lập kế hoạch</MenuItem>
                        <MenuItem value="in_progress">Đang thi công</MenuItem>
                        <MenuItem value="on_hold">Tạm dừng</MenuItem>
                        <MenuItem value="completed">Hoàn thành</MenuItem>
                        <MenuItem value="cancelled">Đã hủy</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              {project && project.stages && project.stages.length > 0 && (
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={autoCalculateProgress}
                        onChange={(e) => {
                          setAutoCalculateProgress(e.target.checked);
                          if (e.target.checked) {
                            const calculatedProgress = calculateProgressFromStages(project.stages);
                            setValue('progress', calculatedProgress);
                          }
                        }}
                      />
                    }
                    label="Tính tự động từ stages"
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <Controller
                  name="progress"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Tiến độ (%)"
                      type="number"
                      inputProps={{ min: 0, max: 100, step: 1 }}
                      error={!!errors.progress}
                      helperText={
                        autoCalculateProgress && project?.stages && project.stages.length > 0
                          ? `Tự động: ${calculateProgressFromStages(project.stages)}% (${project.stages.filter((s) => s.status === 'completed').length}/${project.stages.length} stages hoàn thành)`
                          : errors.progress?.message || 'Nhập từ 0-100'
                      }
                      value={field.value || ''}
                      onChange={(e) => {
                        if (autoCalculateProgress) {
                          return; // Không cho phép chỉnh sửa khi đang ở chế độ tự động
                        }
                        const value = parseInt(e.target.value, 10);
                        if (isNaN(value)) {
                          field.onChange(0);
                        } else {
                          field.onChange(Math.min(100, Math.max(0, value)));
                        }
                      }}
                      disabled={autoCalculateProgress}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Hủy</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </LocalizationProvider>
  );
}
