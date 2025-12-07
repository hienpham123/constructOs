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
  CircularProgress,
} from '@mui/material';
import { Button } from '../components/common';
import Breadcrumb from '../components/common/Breadcrumb';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/vi';
import { Personnel } from '../types';
import { usePersonnelStore } from '../stores/personnelStore';
import { useProjectStore } from '../stores/projectStore';
import { personnelAPI, rolesAPI, Role } from '../services/api';
import { normalizePersonnel } from '../utils/normalize';
import SaveIcon from '@mui/icons-material/Save';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

const personnelSchema = z.object({
  name: z.string().min(1, 'Họ và tên là bắt buộc'),
  phone: z.string().min(1, 'Số điện thoại là bắt buộc'),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  position: z.string().min(1, 'Vị trí là bắt buộc'),
  status: z.enum(['active', 'inactive', 'on_leave', 'banned']),
  projectId: z.string().optional(),
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
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  
  const personnelId = isEditMode && id ? id : null;

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    const fetchRoles = async () => {
      setIsLoadingRoles(true);
      try {
        const data = await rolesAPI.getAll();
        setRoles(data);
      } catch (error: any) {
        console.error('Error fetching roles:', error);
      } finally {
        setIsLoadingRoles(false);
      }
    };
    fetchRoles();
  }, []);

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
      name: '',
      phone: '',
      email: '',
      position: '',
      status: 'active' as const,
      projectId: '',
    },
  });

  useEffect(() => {
    if (personnelData) {
      reset({
        name: personnelData.name || '',
        phone: personnelData.phone || '',
        email: personnelData.email || '',
        position: personnelData.position || '',
        status: (personnelData as any).status || 'active',
        projectId: personnelData.projectId || (personnelData as any).project_id || '',
      });
    } else if (!isEditMode) {
      reset({
        name: '',
        phone: '',
        email: '',
        position: '',
        status: 'active' as const,
        projectId: '',
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
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        position: data.position,
        status: data.status,
        projectId: data.projectId || undefined,
        projectName: selectedProject?.name || undefined,
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
          <Breadcrumb
            items={[
              { label: 'Trang chủ', path: '/' },
              { label: 'Nhân sự', path: '/personnel' },
              { label: isEditMode ? 'Chỉnh sửa nhân sự' : 'Thêm nhân sự mới' },
            ]}
          />
          
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {isEditMode ? 'Chỉnh sửa nhân sự' : 'Thêm nhân sự mới'}
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
                    <FormControl fullWidth error={!!errors.position}>
                      <InputLabel>Vị trí *</InputLabel>
                      <Select 
                        {...field} 
                        label="Vị trí *"
                        disabled={isLoadingRoles}
                      >
                        {roles.map((role) => (
                          <MenuItem key={role.id} value={role.id}>
                            {role.description || role.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.position && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                          {errors.position.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.status}>
                      <InputLabel>Tình trạng *</InputLabel>
                      <Select
                        {...field}
                        label="Tình trạng *"
                        value={field.value || 'active'}
                      >
                        <MenuItem value="active">Hoạt động</MenuItem>
                        <MenuItem value="inactive">Không hoạt động</MenuItem>
                        <MenuItem value="on_leave">Nghỉ phép</MenuItem>
                        <MenuItem value="banned">Bị cấm</MenuItem>
                      </Select>
                    </FormControl>
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
            </Grid>
          </form>
        </Paper>
      </Box>
    </LocalizationProvider>
  );
}

