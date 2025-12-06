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
} from '@mui/material';
import { Material } from '../../types';
import { useMaterialStore } from '../../stores/materialStore';
import { formatCurrencyInput, parseCurrencyInput } from '../../utils/currencyFormat';
import { normalizeNumber } from '../../utils/normalize';

const materialSchema = z.object({
  code: z.string().min(1, 'Mã vật tư là bắt buộc'),
  name: z.string().min(1, 'Tên vật tư là bắt buộc'),
  category: z.string().min(1, 'Danh mục là bắt buộc'),
  unit: z.string().min(1, 'Đơn vị là bắt buộc'),
  currentStock: z.number().min(0, 'Tồn kho phải >= 0'),
  minStock: z.number().min(0, 'Tồn kho tối thiểu phải >= 0'),
  maxStock: z.number().min(0, 'Tồn kho tối đa phải >= 0'),
  unitPrice: z.number().min(0, 'Đơn giá phải >= 0'),
  supplier: z.string().optional(),
  location: z.string().optional(),
});

type MaterialFormData = z.infer<typeof materialSchema>;

interface MaterialFormProps {
  open: boolean;
  onClose: () => void;
  material?: Material | null;
}

export default function MaterialForm({ open, onClose, material }: MaterialFormProps) {
  const { addMaterial, updateMaterial } = useMaterialStore();
  const isSubmittingRef = useRef(false);
  
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MaterialFormData>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      code: '',
      name: '',
      category: '',
      unit: '',
      currentStock: 0,
      minStock: 0,
      maxStock: 0,
      unitPrice: 0,
      supplier: '',
      location: '',
    },
  });

  useEffect(() => {
    if (!open) {
      isSubmittingRef.current = false;
      return;
    }
    
    if (material) {
      reset({
        code: material.code || '',
        name: material.name || '',
        category: material.category || '',
        unit: material.unit || '',
        currentStock: normalizeNumber(material.currentStock || (material as any).current_stock),
        minStock: normalizeNumber(material.minStock || (material as any).min_stock),
        maxStock: normalizeNumber(material.maxStock || (material as any).max_stock),
        unitPrice: normalizeNumber(material.unitPrice || (material as any).unit_price),
        supplier: material.supplier || '',
        location: material.location || '',
      });
    } else {
      reset({
        code: '',
        name: '',
        category: '',
        unit: '',
        currentStock: 0,
        minStock: 0,
        maxStock: 0,
        unitPrice: 0,
        supplier: '',
        location: '',
      });
    }
  }, [material?.id, open, reset]);

  const onSubmit = async (data: MaterialFormData) => {
    // Prevent duplicate submission
    if (isSubmittingRef.current || isSubmitting) {
      return;
    }
    
    isSubmittingRef.current = true;
    
    try {
      const materialData = {
        code: data.code,
        name: data.name,
        category: data.category,
        unit: data.unit,
        currentStock: data.currentStock,
        minStock: data.minStock,
        maxStock: data.maxStock,
        unitPrice: data.unitPrice,
        supplier: data.supplier || '',
        location: data.location || '',
      };

      if (material) {
        await updateMaterial(material.id, materialData);
      } else {
        await addMaterial(materialData);
      }
      isSubmittingRef.current = false;
      onClose();
    } catch (error: any) {
      console.error('Error saving material:', error);
      // Error notification đã được xử lý bởi API interceptor
      isSubmittingRef.current = false;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{material ? 'Chỉnh sửa vật tư' : 'Thêm vật tư mới'}</DialogTitle>
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
                    label="Mã vật tư"
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
                    label="Tên vật tư"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Danh mục"
                    error={!!errors.category}
                    helperText={errors.category?.message}
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="unit"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Đơn vị"
                    error={!!errors.unit}
                    helperText={errors.unit?.message}
                    required
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="currentStock"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Tồn kho hiện tại"
                    error={!!errors.currentStock}
                    helperText={errors.currentStock?.message}
                    required
                    value={formatCurrencyInput(field.value || 0)}
                    onChange={(e) => {
                      const parsed = parseCurrencyInput(e.target.value);
                      field.onChange(parsed);
                    }}
                    inputProps={{
                      inputMode: 'numeric',
                      pattern: '[0-9,]*',
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="minStock"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Tồn kho tối thiểu"
                    error={!!errors.minStock}
                    helperText={errors.minStock?.message}
                    required
                    value={formatCurrencyInput(field.value || 0)}
                    onChange={(e) => {
                      const parsed = parseCurrencyInput(e.target.value);
                      field.onChange(parsed);
                    }}
                    inputProps={{
                      inputMode: 'numeric',
                      pattern: '[0-9,]*',
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="maxStock"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Tồn kho tối đa"
                    error={!!errors.maxStock}
                    helperText={errors.maxStock?.message}
                    required
                    value={formatCurrencyInput(field.value || 0)}
                    onChange={(e) => {
                      const parsed = parseCurrencyInput(e.target.value);
                      field.onChange(parsed);
                    }}
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
                name="unitPrice"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Đơn giá (VND)"
                    error={!!errors.unitPrice}
                    helperText={errors.unitPrice?.message}
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
                name="supplier"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Nhà cung cấp"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Vị trí trong kho"
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
  );
}

