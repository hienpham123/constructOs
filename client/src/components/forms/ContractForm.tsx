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
import { Contract } from '../../types';
import { useContractStore } from '../../stores/contractStore';
import { useProjectStore } from '../../stores/projectStore';
import { showError } from '../../utils/notifications';
import { formatCurrencyInput, parseCurrencyInput } from '../../utils/currencyFormat';
import { normalizeNumber } from '../../utils/normalize';

const contractSchema = z.object({
  code: z.string().min(1, 'Mã hợp đồng là bắt buộc'),
  name: z.string().min(1, 'Tên hợp đồng là bắt buộc'),
  type: z.enum(['construction', 'supply', 'service', 'labor']),
  client: z.string().min(1, 'Khách hàng là bắt buộc'),
  projectId: z.string().optional(),
  value: z.number().min(0, 'Giá trị hợp đồng phải >= 0'),
  startDate: z.any().refine((val) => val !== null && val !== undefined, {
    message: 'Ngày bắt đầu là bắt buộc',
  }),
  endDate: z.any().refine((val) => val !== null && val !== undefined, {
    message: 'Ngày kết thúc là bắt buộc',
  }),
  status: z.enum(['draft', 'pending', 'active', 'completed', 'terminated']),
  signedDate: z.any().optional(),
});

type ContractFormData = z.infer<typeof contractSchema>;

interface ContractFormProps {
  open: boolean;
  onClose: () => void;
  contract?: Contract | null;
}

export default function ContractForm({ open, onClose, contract }: ContractFormProps) {
  const { addContract, updateContract } = useContractStore();
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
  } = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      code: '',
      name: '',
      type: 'construction',
      client: '',
      projectId: '',
      value: 0,
      startDate: dayjs(),
      endDate: dayjs().add(1, 'month'),
      status: 'draft',
      signedDate: null,
    },
  });

  useEffect(() => {
    if (!open) {
      isSubmittingRef.current = false;
      return;
    }

    if (contract) {
      const parseDate = (dateString: string | undefined | null): Dayjs | null => {
        if (!dateString) return null;
        return dayjs(dateString);
      };

      reset({
        code: contract.code || '',
        name: contract.name || '',
        type: contract.type || 'construction',
        client: contract.client || '',
        projectId: contract.projectId || '',
        value: normalizeNumber(contract.value || (contract as any).value),
        startDate: parseDate(contract.startDate || (contract as any).start_date),
        endDate: parseDate(contract.endDate || (contract as any).end_date),
        status: contract.status || 'draft',
        signedDate: parseDate(contract.signedDate || (contract as any).signed_date),
      });
    } else {
      reset({
        code: '',
        name: '',
        type: 'construction',
        client: '',
        projectId: '',
        value: 0,
        startDate: dayjs(),
        endDate: dayjs().add(1, 'month'),
        status: 'draft',
        signedDate: null,
      });
    }
  }, [contract?.id, open, reset]);

  const onSubmit = async (data: ContractFormData) => {
    if (isSubmittingRef.current || isSubmitting) {
      return;
    }

    isSubmittingRef.current = true;

    try {
      // Find selected project to get projectName
      const selectedProject = data.projectId 
        ? projects.find((p) => p.id === data.projectId)
        : null;

      const contractData = {
        code: data.code,
        name: data.name,
        type: data.type,
        client: data.client,
        projectId: data.projectId || undefined,
        projectName: selectedProject?.name || undefined,
        value: data.value,
        startDate: data.startDate ? dayjs(data.startDate).format('YYYY-MM-DD') : '',
        endDate: data.endDate ? dayjs(data.endDate).format('YYYY-MM-DD') : '',
        status: data.status,
        signedDate: data.signedDate ? dayjs(data.signedDate).format('YYYY-MM-DD') : undefined,
        documents: contract?.documents || [],
      };

      if (contract) {
        await updateContract(contract.id, contractData);
      } else {
        await addContract(contractData);
      }
      onClose();
    } catch (error: any) {
      console.error('Error saving contract:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Không thể lưu hợp đồng';
      showError(errorMessage);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{contract ? 'Chỉnh sửa hợp đồng' : 'Thêm hợp đồng mới'}</DialogTitle>
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
                      label="Mã hợp đồng"
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
                      label="Tên hợp đồng"
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
                      <InputLabel>Loại hợp đồng</InputLabel>
                      <Select {...field} label="Loại hợp đồng">
                        <MenuItem value="construction">Thi công</MenuItem>
                        <MenuItem value="supply">Cung cấp</MenuItem>
                        <MenuItem value="service">Dịch vụ</MenuItem>
                        <MenuItem value="labor">Nhân công</MenuItem>
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
                        <MenuItem value="draft">Bản nháp</MenuItem>
                        <MenuItem value="pending">Chờ ký</MenuItem>
                        <MenuItem value="active">Đang hiệu lực</MenuItem>
                        <MenuItem value="completed">Hoàn thành</MenuItem>
                        <MenuItem value="terminated">Chấm dứt</MenuItem>
                      </Select>
                    </FormControl>
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
                  name="value"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      label="Giá trị hợp đồng (VND)"
                      error={!!errors.value}
                      helperText={errors.value?.message}
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
                  name="signedDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label="Ngày ký"
                      format="DD/MM/YYYY"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.signedDate,
                          helperText: errors.signedDate?.message as string,
                        },
                      }}
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
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>Hủy</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {contract ? 'Cập nhật' : 'Thêm'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </LocalizationProvider>
  );
}

