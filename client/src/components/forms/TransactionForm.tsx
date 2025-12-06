import { useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { MaterialTransaction } from '../../types';
import { useMaterialStore } from '../../stores/materialStore';
import { useProjectStore } from '../../stores/projectStore';
import { useAuthStore } from '../../stores/authStore';

const transactionSchema = z.object({
  materialId: z.string().min(1, 'Vật tư là bắt buộc'),
  type: z.enum(['import', 'export', 'adjustment']),
  quantity: z.number().min(0.01, 'Số lượng phải > 0'),
  projectId: z.string().optional(),
  reason: z.string().min(1, 'Lý do là bắt buộc'),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  transaction?: MaterialTransaction | null;
}

export default function TransactionForm({ open, onClose, transaction }: TransactionFormProps) {
  const { addTransaction, updateTransaction, materials } = useMaterialStore();
  const { projects } = useProjectStore();
  const { user } = useAuthStore();
  const isSubmittingRef = useRef(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      materialId: '',
      type: 'import',
      quantity: 0,
      projectId: '',
      reason: '',
    },
  });

  const selectedMaterialId = watch('materialId');

  useEffect(() => {
    if (!open) {
      isSubmittingRef.current = false;
      return;
    }

    if (transaction) {
      reset({
        materialId: transaction.materialId || '',
        type: transaction.type || 'import',
        quantity: transaction.quantity || 0,
        projectId: transaction.projectId || '',
        reason: transaction.reason || '',
      });
    } else {
      reset({
        materialId: '',
        type: 'import',
        quantity: 0,
        projectId: '',
        reason: '',
      });
    }
  }, [transaction?.id, open, reset]);

  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId);

  const onSubmit = async (data: TransactionFormData) => {
    if (isSubmittingRef.current || isSubmitting) {
      return;
    }

    isSubmittingRef.current = true;

    try {
      const selectedMaterialObj = materials.find((m) => m.id === data.materialId);
      const selectedProject = data.projectId ? projects.find((p) => p.id === data.projectId) : null;

      const transactionData = {
        materialId: data.materialId,
        materialName: selectedMaterialObj?.name || '',
        type: data.type,
        quantity: data.quantity,
        unit: selectedMaterialObj?.unit || '',
        projectId: data.projectId || undefined,
        projectName: selectedProject?.name || undefined,
        reason: data.reason,
        performedBy: user?.name || user?.email || '',
      };

      if (transaction?.id) {
        await updateTransaction(transaction.id, transactionData);
      } else {
        await addTransaction(transactionData);
      }
      onClose();
    } catch (error: any) {
      console.error('Error saving transaction:', error);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{transaction ? 'Chỉnh sửa giao dịch' : 'Thêm giao dịch nhập/xuất kho'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="materialId"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    options={materials}
                    getOptionLabel={(option) => option ? `${option.code} - ${option.name}` : ''}
                    value={materials.find((m) => m.id === field.value) || null}
                    onChange={(_, newValue) => field.onChange(newValue?.id || '')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Vật tư"
                        placeholder="Tìm kiếm vật tư..."
                        required
                        error={!!errors.materialId}
                        helperText={errors.materialId?.message}
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
                    <InputLabel>Loại giao dịch</InputLabel>
                    <Select {...field} label="Loại giao dịch">
                      <MenuItem value="import">Nhập kho</MenuItem>
                      <MenuItem value="export">Xuất kho</MenuItem>
                      <MenuItem value="adjustment">Điều chỉnh</MenuItem>
                    </Select>
                    {errors.type && <span style={{ color: 'red', fontSize: '0.75rem', marginTop: '3px' }}>{errors.type.message}</span>}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="quantity"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Số lượng"
                    type="number"
                    inputProps={{ step: '0.01', min: '0.01' }}
                    error={!!errors.quantity}
                    helperText={errors.quantity?.message || (selectedMaterial ? `Đơn vị: ${selectedMaterial.unit}` : '')}
                    required
                    value={field.value || ''}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      field.onChange(value);
                    }}
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
                name="reason"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Lý do"
                    multiline
                    rows={3}
                    error={!!errors.reason}
                    helperText={errors.reason?.message}
                    required
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Hủy</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {transaction ? 'Cập nhật' : 'Thêm'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

