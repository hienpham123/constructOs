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
  Grid,
} from '@mui/material';
import { Button } from '../common';
import { Material } from '../../types';
import { useMaterialStore } from '../../stores/materialStore';
import { formatCurrencyInput, parseCurrencyInput } from '../../utils/currencyFormat';
import { normalizeNumber } from '../../utils/normalize';

const materialSchema = z.object({
  name: z.string().min(1, 'Tên vật tư là bắt buộc'),
  type: z.string().min(1, 'Chủng loại là bắt buộc'),
  unit: z.string().min(1, 'Đơn vị là bắt buộc'),
  currentStock: z.number().min(0, 'Tồn kho phải >= 0'),
  importPrice: z.number().min(0, 'Đơn giá nhập phải >= 0'),
  supplier: z.string().optional(),
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
      name: '',
      type: '',
      unit: '',
      currentStock: 0,
      importPrice: 0,
      supplier: '',
    },
  });

  useEffect(() => {
    if (!open) {
      isSubmittingRef.current = false;
      return;
    }
    
    if (material) {
      reset({
        name: material.name || '',
        type: material.type || (material as any).category || '',
        unit: material.unit || '',
        currentStock: normalizeNumber(material.currentStock || (material as any).current_stock),
        importPrice: normalizeNumber(material.importPrice || (material as any).import_price || (material as any).unit_price),
        supplier: material.supplier || '',
      });
    } else {
      reset({
        name: '',
        type: '',
        unit: '',
        currentStock: 0,
        importPrice: 0,
        supplier: '',
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
        name: data.name,
        type: data.type,
        unit: data.unit,
        currentStock: data.currentStock,
        importPrice: data.importPrice,
        supplier: data.supplier || '',
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
            <Grid item xs={12}>
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
                name="type"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Chủng loại"
                    error={!!errors.type}
                    helperText={errors.type?.message}
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
            <Grid item xs={12} sm={6}>
              <Controller
                name="currentStock"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Tồn kho"
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
            <Grid item xs={12} sm={6}>
              <Controller
                name="importPrice"
                control={control}
                render={({ field }) => (
                  <TextField
                    fullWidth
                    label="Đơn giá nhập (VND)"
                    error={!!errors.importPrice}
                    helperText={errors.importPrice?.message}
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
            <Grid item xs={12}>
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

