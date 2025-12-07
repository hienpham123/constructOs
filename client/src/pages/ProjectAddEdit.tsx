import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dayjs } from 'dayjs';
import dayjs from '../config/dayjs';
import {
  Box,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Checkbox,
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
import { Project } from '../types';
import { useProjectStore } from '../stores/projectStore';
import { useAuthStore } from '../stores/authStore';
import { projectsAPI } from '../services/api';
import { normalizeProject } from '../utils/normalize';
import { formatCurrencyInput, parseCurrencyInput } from '../utils/currencyFormat';
import { normalizeNumber } from '../utils/normalize';
import HomeIcon from '@mui/icons-material/Home';
import SaveIcon from '@mui/icons-material/Save';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

const projectSchema = z.object({
  name: z.string().min(1, 'Tên dự án là bắt buộc'),
  description: z.string().optional(),
  investor: z.string().min(1, 'Chủ đầu tư là bắt buộc'),
  contactPerson: z.string().optional(),
  location: z.string().min(1, 'Địa điểm là bắt buộc'),
  startDate: z.any().refine((val) => val !== null && val !== undefined, {
    message: 'Ngày bắt đầu là bắt buộc',
  }),
  endDate: z.any().refine((val) => val !== null && val !== undefined, {
    message: 'Ngày kết thúc là bắt buộc',
  }),
  budget: z.number().min(0, 'Ngân sách phải >= 0'),
  status: z.enum(['quoting', 'contract_signed_in_progress', 'completed', 'on_hold', 'design_consulting', 'in_progress', 'design_appraisal', 'preparing_acceptance', 'failed']),
  progress: z.number().min(0).max(100, 'Tiến độ phải từ 0-100'),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function ProjectAddEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, fetchProjects, addProject, updateProject } = useProjectStore();
  const { user } = useAuthStore();
  const isSubmittingRef = useRef(false);
  const isEditMode = Boolean(id);
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const projectId = isEditMode && id ? id : null;
  
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      investor: '',
      contactPerson: '',
      location: '',
      startDate: null,
      endDate: null,
      budget: 0,
      status: 'quoting',
      progress: 0,
    },
  });

  // Fetch project by ID when in edit mode
  useEffect(() => {
    const loadProject = async () => {
      if (isEditMode && projectId) {
        setIsLoading(true);
        try {
          // First check if it's already in store
          const foundInStore = projects.find((p) => String(p.id) === String(projectId));
          if (foundInStore) {
            setProject(foundInStore);
            setIsLoading(false);
            return;
          }
          
          // If not in store, fetch by ID
          const data = await projectsAPI.getById(projectId);
          const normalized = normalizeProject(data);
          setProject(normalized);
        } catch (error: any) {
          console.error('Error fetching project:', error);
          setIsLoading(false);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadProject();
  }, [isEditMode, projectId, projects]);

  useEffect(() => {
    if (project) {
      reset({
        name: project.name || '',
        description: project.description || '',
        investor: project.investor || '',
        contactPerson: project.contactPerson || '',
        location: project.location || '',
        startDate: project.startDate ? dayjs(project.startDate) : null,
        endDate: project.endDate ? dayjs(project.endDate) : null,
        budget: project.budget || 0,
        status: project.status || 'quoting',
        progress: project.progress || 0,
      });
    } else if (!isEditMode) {
      reset({
        name: '',
        description: '',
        investor: '',
        contactPerson: '',
        location: '',
        startDate: null,
        endDate: null,
        budget: 0,
        status: 'quoting',
        progress: 0,
      });
    }
  }, [project, isEditMode, reset]);

  const onSubmit = async (data: ProjectFormData) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    try {
      const projectData = {
        name: data.name,
        description: data.description || '',
        investor: data.investor,
        contactPerson: data.contactPerson || '',
        location: data.location,
        startDate: (data.startDate as Dayjs).format('YYYY-MM-DD'),
        endDate: (data.endDate as Dayjs).format('YYYY-MM-DD'),
        budget: normalizeNumber(data.budget),
        actualCost: project?.actualCost || 0,
        progress: normalizeNumber(data.progress),
        managerId: user?.id || '',
        managerName: user?.name || '',
        status: data.status,
      };

      if (isEditMode && id) {
        await updateProject(id, projectData);
      } else {
        await addProject(projectData);
      }
      
      navigate('/projects');
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const handleExit = () => {
    navigate('/projects');
  };

  if (isEditMode && isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      <Box>
        {/* Header với breadcrumb và buttons */}
        <Box sx={{ mb: 3 }}>
          <Breadcrumbs sx={{ mb: 2 }}>
            <Link
              component="button"
              variant="body1"
              onClick={() => navigate('/')}
              sx={{ textDecoration: 'none', color: 'text.primary', cursor: 'pointer' }}
            >
              <HomeIcon sx={{ mr: 0.5, verticalAlign: 'middle', fontSize: 20 }} />
              Trang chủ
            </Link>
            <Link
              component="button"
              variant="body1"
              onClick={() => navigate('/projects')}
              sx={{ textDecoration: 'none', color: 'text.primary', cursor: 'pointer' }}
            >
              Dự án
            </Link>
            <Typography color="text.primary">
              {isEditMode ? 'Chỉnh sửa dự án' : 'Thêm dự án mới'}
            </Typography>
          </Breadcrumbs>
          
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {isEditMode ? 'Chỉnh sửa dự án' : 'Thêm dự án mới'}
            </Typography>
            <Box display="flex" gap={1}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang lưu...' : 'Lưu dữ liệu'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<ExitToAppIcon />}
                onClick={handleExit}
              >
                Thoát
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Form content */}
        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Tên dự án *"
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="investor"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Chủ đầu tư *"
                      fullWidth
                      error={!!errors.investor}
                      helperText={errors.investor?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="contactPerson"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Đầu mối"
                      fullWidth
                      error={!!errors.contactPerson}
                      helperText={errors.contactPerson?.message}
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
                      label="Địa điểm *"
                      fullWidth
                      error={!!errors.location}
                      helperText={errors.location?.message}
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
                      label="Ngày bắt đầu *"
                      format="DD/MM/YYYY"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.startDate,
                          helperText: errors.startDate?.message as string,
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
                      label="Ngày kết thúc *"
                      format="DD/MM/YYYY"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.endDate,
                          helperText: errors.endDate?.message as string,
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
                      {...field}
                      label="Ngân sách *"
                      fullWidth
                      type="text"
                      error={!!errors.budget}
                      helperText={errors.budget?.message}
                      value={formatCurrencyInput(field.value || 0)}
                      onChange={(e) => {
                        const parsed = parseCurrencyInput(e.target.value);
                        field.onChange(parsed);
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
                    <FormControl fullWidth error={!!errors.status}>
                      <InputLabel>Trạng thái *</InputLabel>
                      <Select {...field} label="Trạng thái *">
                        <MenuItem value="quoting">Đang báo giá</MenuItem>
                        <MenuItem value="contract_signed_in_progress">Đã ký HĐ - Đang thi công</MenuItem>
                        <MenuItem value="in_progress">Đang thi công</MenuItem>
                        <MenuItem value="design_consulting">Tư vấn thiết kế</MenuItem>
                        <MenuItem value="design_appraisal">Thẩm định thiết kế</MenuItem>
                        <MenuItem value="preparing_acceptance">Chuẩn bị nghiệm thu</MenuItem>
                        <MenuItem value="completed">Hoàn thành</MenuItem>
                        <MenuItem value="on_hold">Tạm dừng</MenuItem>
                        <MenuItem value="failed">Thất bại</MenuItem>
                      </Select>
                    </FormControl>
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
                      label="Mô tả"
                      fullWidth
                      multiline
                      rows={4}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="progress"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Tiến độ (%) *"
                      fullWidth
                      type="number"
                      inputProps={{ min: 0, max: 100 }}
                      error={!!errors.progress}
                      helperText={errors.progress?.message || 'Nhập từ 0-100'}
                      value={field.value || ''}
                      onChange={(e) => {
                        const value = parseInt(e.target.value, 10);
                        if (isNaN(value)) {
                          field.onChange(0);
                        } else {
                          field.onChange(Math.min(100, Math.max(0, value)));
                        }
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
}

