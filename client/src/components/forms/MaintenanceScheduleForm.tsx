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
import { MaintenanceSchedule } from '../../types';
import { useEquipmentStore } from '../../stores/equipmentStore';
import { formatCurrencyInput, parseCurrencyInput } from '../../utils/currencyFormat';

const maintenanceSchema = z.object({
  equipmentId: z.string().min(1, 'Thiết bị là bắt buộc'),
  type: z.enum(['routine', 'repair', 'inspection']),
  scheduledDate: z.any().refine((val) => val !== null && val !== undefined, {
    message: 'Ngày lên lịch là bắt buộc',
  }),
  completedDate: z.any().optional(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'overdue']),
  description: z.string().min(1, 'Mô tả là bắt buộc'),
  cost: z.number().min(0).optional(),
  technician: z.string().optional(),
});

type MaintenanceScheduleFormData = z.infer<typeof maintenanceSchema>;

interface MaintenanceScheduleFormProps {
  open: boolean;
  onClose: () => void;
  schedule?: MaintenanceSchedule | null;
}

export default function MaintenanceScheduleForm({ open, onClose, schedule }: MaintenanceScheduleFormProps) {
  const { addMaintenanceSchedule, updateMaintenanceSchedule, equipment } = useEquipmentStore();
  const isSubmittingRef = useRef(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MaintenanceScheduleFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      equipmentId: '',
      type: 'routine',
      scheduledDate: dayjs(),
      completedDate: null,
      status: 'scheduled',
      description: '',
      cost: 0,
      technician: '',
    },
  });

  useEffect(() => {
    if (!open) {
      isSubmittingRef.current = false;
      return;
    }

    if (schedule) {
      reset({
        equipmentId: schedule.equipmentId || '',
        type: schedule.type || 'routine',
        scheduledDate: schedule.scheduledDate ? dayjs(schedule.scheduledDate) : dayjs(),
        completedDate: schedule.completedDate ? dayjs(schedule.completedDate) : null,
        status: schedule.status || 'scheduled',
        description: schedule.description || '',
        cost: schedule.cost || 0,
        technician: schedule.technician || '',
      });
    } else {
      reset({
        equipmentId: '',
        type: 'routine',
        scheduledDate: dayjs(),
        completedDate: null,
        status: 'scheduled',
        description: '',
        cost: 0,
        technician: '',
      });
    }
  }, [schedule?.id, open, reset]);

  const onSubmit = async (data: MaintenanceScheduleFormData) => {
    if (isSubmittingRef.current || isSubmitting) {
      return;
    }

    isSubmittingRef.current = true;

    try {
      const selectedEquipment = equipment.find((e) => e.id === data.equipmentId);

      const scheduleData = {
        equipmentId: data.equipmentId,
        equipmentName: selectedEquipment?.name || '',
        type: data.type,
        scheduledDate: data.scheduledDate ? dayjs(data.scheduledDate).format('YYYY-MM-DD') : '',
        completedDate: data.completedDate ? dayjs(data.completedDate).format('YYYY-MM-DD') : undefined,
        status: data.status,
        description: data.description,
        cost: data.cost || undefined,
        technician: data.technician || undefined,
      };

      if (schedule?.id) {
        await updateMaintenanceSchedule(schedule.id, scheduleData);
      } else {
        await addMaintenanceSchedule(scheduleData);
      }
      onClose();
    } catch (error: any) {
      console.error('Error saving maintenance schedule:', error);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{schedule ? 'Chỉnh sửa lịch bảo trì' : 'Thêm lịch bảo trì mới'}</DialogTitle>
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
              <Grid item xs={12} sm={6}>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth required error={!!errors.type}>
                      <InputLabel>Loại bảo trì</InputLabel>
                      <Select {...field} label="Loại bảo trì">
                        <MenuItem value="routine">Định kỳ</MenuItem>
                        <MenuItem value="repair">Sửa chữa</MenuItem>
                        <MenuItem value="inspection">Kiểm tra</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth required error={!!errors.status}>
                      <InputLabel>Trạng thái</InputLabel>
                      <Select {...field} label="Trạng thái">
                        <MenuItem value="scheduled">Đã lên lịch</MenuItem>
                        <MenuItem value="in_progress">Đang thực hiện</MenuItem>
                        <MenuItem value="completed">Hoàn thành</MenuItem>
                        <MenuItem value="overdue">Quá hạn</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="scheduledDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label="Ngày lên lịch"
                      format="DD/MM/YYYY"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          required: true,
                          error: !!errors.scheduledDate,
                          helperText: errors.scheduledDate?.message as string,
                        },
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="completedDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label="Ngày hoàn thành (Tùy chọn)"
                      format="DD/MM/YYYY"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.completedDate,
                          helperText: errors.completedDate?.message as string,
                        },
                      }}
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
                      required
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="cost"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      label="Chi phí (VND)"
                      error={!!errors.cost}
                      helperText={errors.cost?.message}
                      value={formatCurrencyInput(field.value || 0)}
                      onChange={(e) => {
                        const parsed = parseCurrencyInput(e.target.value);
                        field.onChange(parsed);
                      }}
                      inputProps={{ inputMode: 'numeric', pattern: '[0-9,]*' }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="technician"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Kỹ thuật viên"
                      error={!!errors.technician}
                      helperText={errors.technician?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Hủy</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {schedule ? 'Cập nhật' : 'Thêm'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </LocalizationProvider>
  );
}

