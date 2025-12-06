import { useEffect, useRef, useState } from 'react';
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
  Button,
  Grid,
  Autocomplete,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/vi';
import { EquipmentUsage } from '../../types';
import { useEquipmentStore } from '../../stores/equipmentStore';
import { useProjectStore } from '../../stores/projectStore';
import { usersAPI } from '../../services/api';

const usageSchema = z.object({
  equipmentId: z.string().min(1, 'Thiết bị là bắt buộc'),
  projectId: z.string().optional(),
  userId: z.string().min(1, 'Người sử dụng là bắt buộc'),
  startTime: z.any().refine((val) => val !== null && val !== undefined, {
    message: 'Thời gian bắt đầu là bắt buộc',
  }),
  endTime: z.any().optional(),
  fuelConsumption: z.number().min(0).optional(),
  notes: z.string().optional(),
});

type UsageFormData = z.infer<typeof usageSchema>;

interface UsageFormProps {
  open: boolean;
  onClose: () => void;
  usage?: EquipmentUsage | null;
}

export default function UsageForm({ open, onClose, usage }: UsageFormProps) {
  const { addUsage, updateUsage, equipment } = useEquipmentStore();
  const { projects, fetchProjects } = useProjectStore();
  const [users, setUsers] = useState<any[]>([]);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (open) {
      fetchProjects();
      // Fetch users for dropdown
      usersAPI.getAll(100, 0).then((response) => {
        const usersData = Array.isArray(response) ? response : (response.data || []);
        setUsers(usersData);
      }).catch((error) => {
        console.error('Error fetching users:', error);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UsageFormData>({
    resolver: zodResolver(usageSchema),
    defaultValues: {
      equipmentId: '',
      projectId: '',
      userId: '',
      startTime: dayjs(),
      endTime: null,
      fuelConsumption: 0,
      notes: '',
    },
  });

  useEffect(() => {
    if (!open) {
      isSubmittingRef.current = false;
      return;
    }

    if (usage) {
      reset({
        equipmentId: usage.equipmentId || '',
        projectId: usage.projectId || (usage as any).project_id || '',
        userId: usage.userId || (usage as any).user_id || '',
        startTime: usage.startTime ? dayjs(usage.startTime) : dayjs(),
        endTime: usage.endTime ? dayjs(usage.endTime) : null,
        fuelConsumption: usage.fuelConsumption || (usage as any).fuel_consumption || 0,
        notes: usage.notes || '',
      });
    } else {
      reset({
        equipmentId: '',
        projectId: '',
        userId: '',
        startTime: dayjs(),
        endTime: null,
        fuelConsumption: 0,
        notes: '',
      });
    }
  }, [usage?.id, open, reset]);

  const onSubmit = async (data: UsageFormData) => {
    if (isSubmittingRef.current || isSubmitting) {
      return;
    }

    isSubmittingRef.current = true;

    try {
      const selectedEquipment = equipment.find((e) => e.id === data.equipmentId);
      const selectedProject = projects.find((p) => p.id === data.projectId);
      const selectedUser = users.find((u) => u.id === data.userId);

      const usageData = {
        equipmentId: data.equipmentId,
        equipmentName: selectedEquipment?.name || '',
        projectId: data.projectId || undefined,
        projectName: selectedProject?.name || undefined,
        userId: data.userId,
        userName: selectedUser?.name || '',
        startTime: data.startTime ? dayjs(data.startTime).toISOString() : '',
        endTime: data.endTime ? dayjs(data.endTime).toISOString() : undefined,
        fuelConsumption: data.fuelConsumption || undefined,
        notes: data.notes || undefined,
      };

      if (usage?.id) {
        await updateUsage(usage.id, usageData);
      } else {
        await addUsage(usageData);
      }
      onClose();
    } catch (error: any) {
      console.error('Error saving usage:', error);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{usage ? 'Chỉnh sửa lịch sử sử dụng' : 'Thêm lịch sử sử dụng mới'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Controller
                  name="equipmentId"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={equipment}
                      getOptionLabel={(option) => option ? `${option.code} - ${option.name}` : ''}
                      value={equipment.find((e) => e.id === field.value) || null}
                      onChange={(_, newValue) => field.onChange(newValue?.id || '')}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Thiết bị"
                          placeholder="Tìm kiếm thiết bị..."
                          required
                          error={!!errors.equipmentId}
                          helperText={errors.equipmentId?.message}
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
              <Grid item xs={12}>
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
                          label="Dự án (Tùy chọn)"
                          placeholder="Tìm kiếm dự án..."
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
              <Grid item xs={12}>
                <Controller
                  name="userId"
                  control={control}
                  render={({ field }) => (
                    <Autocomplete
                      options={users}
                      getOptionLabel={(option) => option ? option.name : ''}
                      value={users.find((u) => u.id === field.value) || null}
                      onChange={(_, newValue) => field.onChange(newValue?.id || '')}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Người sử dụng"
                          placeholder="Tìm kiếm người dùng..."
                          required
                          error={!!errors.userId}
                          helperText={errors.userId?.message}
                        />
                      )}
                      filterOptions={(options: any[], { inputValue }) => {
                        const searchValue = inputValue.toLowerCase();
                        return options.filter(
                          (option: any) =>
                            option.name.toLowerCase().includes(searchValue) ||
                            option.email.toLowerCase().includes(searchValue)
                        );
                      }}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="startTime"
                  control={control}
                  render={({ field }) => (
                    <DateTimePicker
                      {...field}
                      label="Thời gian bắt đầu"
                      format="DD/MM/YYYY HH:mm"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                          error: !!errors.startTime,
                          helperText: errors.startTime?.message as string,
                        },
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="endTime"
                  control={control}
                  render={({ field }) => (
                    <DateTimePicker
                      {...field}
                      label="Thời gian kết thúc (Tùy chọn)"
                      format="DD/MM/YYYY HH:mm"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.endTime,
                          helperText: errors.endTime?.message as string,
                        },
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="fuelConsumption"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Tiêu hao nhiên liệu (L)"
                      type="number"
                      inputProps={{ min: 0, step: 0.01 }}
                      error={!!errors.fuelConsumption}
                      helperText={errors.fuelConsumption?.message}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Ghi chú"
                      multiline
                      rows={3}
                      error={!!errors.notes}
                      helperText={errors.notes?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Hủy</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {usage ? 'Cập nhật' : 'Thêm'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </LocalizationProvider>
  );
}

