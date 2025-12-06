import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from '../config/dayjs';
import {
  Box,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Autocomplete,
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
import { Personnel } from '../types';
import { usePersonnelStore } from '../stores/personnelStore';
import { useProjectStore } from '../stores/projectStore';
import { personnelAPI } from '../services/api';
import { normalizePersonnel } from '../utils/normalize';
import HomeIcon from '@mui/icons-material/Home';
import SaveIcon from '@mui/icons-material/Save';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

const personnelSchema = z.object({
  code: z.string().min(1, 'Mã nhân sự là bắt buộc'),
  name: z.string().min(1, 'Họ và tên là bắt buộc'),
  phone: z.string().min(1, 'Số điện thoại là bắt buộc'),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  position: z.enum(['worker', 'engineer', 'supervisor', 'team_leader']),
  team: z.string().optional(),
  projectId: z.string().optional(),
  status: z.enum(['active', 'inactive', 'on_leave']),
  hireDate: z.any().refine((val) => val !== null && val !== undefined, {
    message: 'Ngày tuyển dụng là bắt buộc',
  }),
});

type PersonnelFormData = z.infer<typeof personnelSchema>;

export default function PersonnelAddEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { personnel, fetchPersonnel, addPersonnel, updatePersonnel } = usePersonnelStore();
  const { projects, fetchProjects } = useProjectStore();
  const isSubmittingRef = useRef(false);
  const isEditMode = Boolean(id);
  const [personnelData, setPersonnelData] = useState<Personnel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const personnelId = isEditMode && id ? id : null;

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Fetch personnel by ID when in edit mode
  useEffect(() => {
    const loadPersonnel = async () => {
      if (isEditMode && personnelId) {
        setIsLoading(true);
        try {
          // First check if it's already in store
          const foundInStore = personnel.find((p) => String(p.id) === String(personnelId));
          if (foundInStore) {
            setPersonnelData(foundInStore);
            setIsLoading(false);
            return;
          }
          
          // If not in store, fetch by ID
          const data = await personnelAPI.getById(personnelId);
          const normalized = normalizePersonnel(data);
          setPersonnelData(normalized);
        } catch (error: any) {
          console.error('Error fetching personnel:', error);
          setIsLoading(false);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadPersonnel();
  }, [isEditMode, personnelId, personnel]);
  
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PersonnelFormData>({
    resolver: zodResolver(personnelSchema),
    defaultValues: {
      code: '',
      name: '',
      phone: '',
      email: '',
      position: 'worker',
      team: '',
      projectId: '',
      status: 'active',
      hireDate: dayjs(),
    },
  });

  useEffect(() => {
    if (personnelData) {
      reset({
        code: personnelData.code || '',
        name: personnelData.name || '',
        phone: personnelData.phone || '',
        email: personnelData.email || '',
        position: personnelData.position || 'worker',
        team: personnelData.team || '',
        projectId: personnelData.projectId || (personnelData as any).project_id || '',
        status: personnelData.status || 'active',
        hireDate: personnelData.hireDate ? dayjs(personnelData.hireDate || (personnelData as any).hire_date) : dayjs(),
      });
    } else if (!isEditMode) {
      reset({
        code: '',
        name: '',
        phone: '',
        email: '',
        position: 'worker',
        team: '',
        projectId: '',
        status: 'active',
        hireDate: dayjs(),
      });
    }
  }, [personnelData, isEditMode, reset]);

  const onSubmit = async (data: PersonnelFormData) => {
    if (isSubmittingRef.current || isSubmitting) {
      return;
    }
    
    isSubmittingRef.current = true;
    
    try {
      const selectedProject = data.projectId 
        ? projects.find((p) => p.id === data.projectId)
        : null;

      const personnelPayload = {
        code: data.code,
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        position: data.position,
        team: data.team || undefined,
        projectId: data.projectId || undefined,
        projectName: selectedProject?.name || undefined,
        status: data.status,
        hireDate: data.hireDate ? dayjs(data.hireDate).format('YYYY-MM-DD') : '',
      };

      if (isEditMode && id) {
        await updatePersonnel(id, personnelPayload);
      } else {
        await addPersonnel(personnelPayload);
      }
      
      navigate('/personnel');
    } catch (error: any) {
      console.error('Error saving personnel:', error);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const handleExit = () => {
    navigate('/personnel');
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
              onClick={() => navigate('/personnel')}
              sx={{ textDecoration: 'none', color: 'text.primary', cursor: 'pointer' }}
            >
              Nhân sự
            </Link>
            <Typography color="text.primary">
              {isEditMode ? 'Chỉnh sửa nhân sự' : 'Thêm nhân sự mới'}
            </Typography>
          </Breadcrumbs>
          
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {isEditMode ? 'Chỉnh sửa nhân sự' : 'Thêm nhân sự mới'}
            </Typography>
            <Box display="flex" gap={1}>
              <Button
                variant="contained"
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
                  name="code"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Mã nhân sự *"
                      error={!!errors.code}
                      helperText={errors.code?.message}
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
                      label="Họ và tên *"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Số điện thoại *"
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Email"
                      type="email"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="position"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Vị trí *</InputLabel>
                      <Select {...field} label="Vị trí *">
                        <MenuItem value="worker">Công nhân</MenuItem>
                        <MenuItem value="engineer">Kỹ sư</MenuItem>
                        <MenuItem value="supervisor">Giám sát</MenuItem>
                        <MenuItem value="team_leader">Tổ trưởng</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="team"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Tổ đội"
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="projectId"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={projects}
                      getOptionLabel={(option) => option ? option.name : ''}
                      value={projects.find((p) => p.id === field.value) || null}
                      onChange={(_, newValue) => field.onChange(newValue?.id || '')}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Dự án"
                          placeholder="Tìm kiếm dự án..."
                        />
                      )}
                      filterOptions={(options, { inputValue }) => {
                        const searchValue = inputValue.toLowerCase();
                        return options.filter(
                          (option) =>
                            option.name.toLowerCase().includes(searchValue) ||
                            (option.investor || (option as any).client || '').toLowerCase().includes(searchValue)
                        );
                      }}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
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
                      <InputLabel>Trạng thái *</InputLabel>
                      <Select {...field} label="Trạng thái *">
                        <MenuItem value="active">Đang làm việc</MenuItem>
                        <MenuItem value="inactive">Không hoạt động</MenuItem>
                        <MenuItem value="on_leave">Nghỉ phép</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="hireDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label="Ngày tuyển dụng *"
                      format="DD/MM/YYYY"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.hireDate,
                          helperText: errors.hireDate?.message as string,
                        },
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

