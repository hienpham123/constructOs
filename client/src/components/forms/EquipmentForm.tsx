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
import { Equipment } from '../../types';
import { useEquipmentStore } from '../../stores/equipmentStore';
import { useProjectStore } from '../../stores/projectStore';
import { showError } from '../../utils/notifications';
import { normalizeNumber } from '../../utils/normalize';

const equipmentSchema = z.object({
  code: z.string().min(1, 'Mã thiết bị là bắt buộc'),
  name: z.string().min(1, 'Tên thiết bị là bắt buộc'),
  type: z.enum(['excavator', 'crane', 'truck', 'concrete_mixer', 'generator', 'other']),
  brand: z.string().min(1, 'Hãng sản xuất là bắt buộc'),
  model: z.string().min(1, 'Model là bắt buộc'),
  serialNumber: z.string().min(1, 'Số seri là bắt buộc'),
  purchaseDate: z.any().refine((val) => val !== null && val !== undefined, {
    message: 'Ngày mua là bắt buộc',
  }),
  status: z.enum(['available', 'in_use', 'maintenance', 'broken']),
  currentProjectId: z.string().optional(),
  totalHours: z.number().min(0, 'Tổng giờ sử dụng phải >= 0'),
});

type EquipmentFormData = z.infer<typeof equipmentSchema>;

interface EquipmentFormProps {
  open: boolean;
  onClose: () => void;
  equipment?: Equipment | null;
}

export default function EquipmentForm({ open, onClose, equipment }: EquipmentFormProps) {
  const { addEquipment, updateEquipment } = useEquipmentStore();
  const { projects, fetchProjects } = useProjectStore();
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
  } = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      code: '',
      name: '',
      type: 'excavator',
      brand: '',
      model: '',
      serialNumber: '',
      purchaseDate: dayjs(),
      status: 'available',
      currentProjectId: '',
      totalHours: 0,
    },
  });

  useEffect(() => {
    if (!open) {
      isSubmittingRef.current = false;
      return;
    }

    if (equipment) {
      reset({
        code: equipment.code || '',
        name: equipment.name || '',
        type: equipment.type || 'excavator',
        brand: equipment.brand || '',
        model: equipment.model || '',
        serialNumber: equipment.serialNumber || (equipment as any).serial_number || '',
        purchaseDate: equipment.purchaseDate ? dayjs(equipment.purchaseDate || (equipment as any).purchase_date) : dayjs(),
        status: equipment.status || 'available',
        currentProjectId: equipment.currentProjectId || (equipment as any).current_project_id || '',
        totalHours: normalizeNumber(equipment.totalHours || (equipment as any).total_hours || 0),
      });
    } else {
      reset({
        code: '',
        name: '',
        type: 'excavator',
        brand: '',
        model: '',
        serialNumber: '',
        purchaseDate: dayjs(),
        status: 'available',
        currentProjectId: '',
        totalHours: 0,
      });
    }
  }, [equipment?.id, open, reset]);

  const onSubmit = async (data: EquipmentFormData) => {
    if (isSubmittingRef.current || isSubmitting) {
      return;
    }

    isSubmittingRef.current = true;

    try {
      // Find selected project to get projectName
      const selectedProject = data.currentProjectId 
        ? projects.find((p) => p.id === data.currentProjectId)
        : null;

      const equipmentData = {
        code: data.code,
        name: data.name,
        type: data.type,
        brand: data.brand,
        model: data.model,
        serialNumber: data.serialNumber,
        purchaseDate: data.purchaseDate ? dayjs(data.purchaseDate).format('YYYY-MM-DD') : '',
        status: data.status,
        currentProjectId: data.currentProjectId || undefined,
        currentProjectName: selectedProject?.name || undefined,
        totalHours: data.totalHours,
      };

      if (equipment) {
        await updateEquipment(equipment.id, equipmentData);
      } else {
        await addEquipment(equipmentData);
      }
      onClose();
    } catch (error: any) {
      console.error('Error saving equipment:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Không thể lưu thiết bị';
      showError(errorMessage);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{equipment ? 'Chỉnh sửa thiết bị' : 'Thêm thiết bị mới'}</DialogTitle>
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
                      label="Mã thiết bị"
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
                      label="Tên thiết bị"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      required
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
                      <InputLabel>Loại thiết bị</InputLabel>
                      <Select {...field} label="Loại thiết bị">
                        <MenuItem value="excavator">Máy xúc</MenuItem>
                        <MenuItem value="crane">Cần cẩu</MenuItem>
                        <MenuItem value="truck">Xe tải</MenuItem>
                        <MenuItem value="concrete_mixer">Máy trộn bê tông</MenuItem>
                        <MenuItem value="generator">Máy phát điện</MenuItem>
                        <MenuItem value="other">Khác</MenuItem>
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
                        <MenuItem value="available">Sẵn sàng</MenuItem>
                        <MenuItem value="in_use">Đang sử dụng</MenuItem>
                        <MenuItem value="maintenance">Bảo trì</MenuItem>
                        <MenuItem value="broken">Hỏng</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="brand"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Hãng sản xuất"
                      error={!!errors.brand}
                      helperText={errors.brand?.message}
                      required
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="model"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Model"
                      error={!!errors.model}
                      helperText={errors.model?.message}
                      required
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="serialNumber"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Số seri"
                      error={!!errors.serialNumber}
                      helperText={errors.serialNumber?.message}
                      required
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="purchaseDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label="Ngày mua"
                      format="DD/MM/YYYY"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.purchaseDate,
                          helperText: errors.purchaseDate?.message as string,
                          required: true,
                        },
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="currentProjectId"
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
                  name="totalHours"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      label="Tổng giờ sử dụng"
                      type="number"
                      error={!!errors.totalHours}
                      helperText={errors.totalHours?.message}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Hủy</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {equipment ? 'Cập nhật' : 'Thêm'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </LocalizationProvider>
  );
}

