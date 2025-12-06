import { useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from '../../config/dayjs';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Autocomplete,
} from '@mui/material';
import { Button } from '../common';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/vi';
import { Personnel } from '../../types';
import { usePersonnelStore } from '../../stores/personnelStore';
import { useProjectStore } from '../../stores/projectStore';

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

interface PersonnelFormProps {
  open: boolean;
  onClose: () => void;
  personnel?: Personnel | null;
}

export default function PersonnelForm({ open, onClose, personnel }: PersonnelFormProps) {
  const { addPersonnel, updatePersonnel } = usePersonnelStore();
  const { projects, fetchProjects } = useProjectStore();
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (open) {
      fetchProjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  
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
    if (!open) {
      isSubmittingRef.current = false;
      return;
    }

    if (personnel) {
      reset({
        code: personnel.code || '',
        name: personnel.name || '',
        phone: personnel.phone || '',
        email: personnel.email || '',
        position: personnel.position || 'worker',
        team: personnel.team || '',
        projectId: personnel.projectId || (personnel as any).project_id || '',
        status: personnel.status || 'active',
        hireDate: personnel.hireDate ? dayjs(personnel.hireDate || (personnel as any).hire_date) : dayjs(),
      });
    } else {
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
  }, [personnel?.id, open, reset]);

  const onSubmit = async (data: PersonnelFormData) => {
    // Prevent duplicate submission
    if (isSubmittingRef.current || isSubmitting) {
      return;
    }
    
    isSubmittingRef.current = true;
    
    try {
      // Find selected project to get projectName
      const selectedProject = data.projectId 
        ? projects.find((p) => p.id === data.projectId)
        : null;

      const personnelData = {
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

      if (personnel) {
        await updatePersonnel(personnel.id, personnelData);
      } else {
        await addPersonnel(personnelData);
      }
      isSubmittingRef.current = false;
      onClose();
    } catch (error: any) {
      console.error('Error saving personnel:', error);
      // Error notification đã được xử lý bởi API interceptor
      isSubmittingRef.current = false;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{personnel ? 'Chỉnh sửa nhân sự' : 'Thêm nhân sự mới'}</DialogTitle>
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
                    label="Mã nhân sự"
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
                    label="Họ và tên"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    required
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
                    label="Số điện thoại"
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                    required
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
                    <InputLabel>Vị trí</InputLabel>
                    <Select {...field} label="Vị trí">
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
                    <InputLabel>Trạng thái</InputLabel>
                    <Select {...field} label="Trạng thái">
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
                    label="Ngày tuyển dụng"
                    format="DD/MM/YYYY"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        error: !!errors.hireDate,
                        helperText: errors.hireDate?.message as string,
                        required: true,
                      },
                    }}
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

