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
  Autocomplete,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { Button } from '../common';
import { PurchaseRequest } from '../../types';
import { useMaterialStore } from '../../stores/materialStore';
import { useAuthStore } from '../../stores/authStore';

// Note: updatePurchaseRequest is handled via buttons in Materials.tsx, not in this form

const purchaseRequestSchema = z.object({
  materialId: z.string().min(1, 'Vật tư là bắt buộc'),
  quantity: z.number().min(0.01, 'Số lượng phải > 0'),
  reason: z.string().min(1, 'Lý do là bắt buộc'),
});

type PurchaseRequestFormData = z.infer<typeof purchaseRequestSchema>;

interface PurchaseRequestFormProps {
  open: boolean;
  onClose: () => void;
  purchaseRequest?: PurchaseRequest | null;
}

export default function PurchaseRequestForm({ open, onClose, purchaseRequest }: PurchaseRequestFormProps) {
  const { addPurchaseRequest, materials } = useMaterialStore();
  const { user } = useAuthStore();
  const isSubmittingRef = useRef(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PurchaseRequestFormData>({
    resolver: zodResolver(purchaseRequestSchema),
    defaultValues: {
      materialId: '',
      quantity: 0,
      reason: '',
    },
  });

  const selectedMaterialId = watch('materialId');

  useEffect(() => {
    if (!open) {
      isSubmittingRef.current = false;
      return;
    }

    if (purchaseRequest) {
      reset({
        materialId: purchaseRequest.materialId || '',
        quantity: purchaseRequest.quantity || 0,
        reason: purchaseRequest.reason || '',
      });
    } else {
      reset({
        materialId: '',
        quantity: 0,
        reason: '',
      });
    }
  }, [purchaseRequest?.id, open, reset]);

  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId);

  const onSubmit = async (data: PurchaseRequestFormData) => {
    if (isSubmittingRef.current || isSubmitting) {
      return;
    }

    isSubmittingRef.current = true;

    try {
      const selectedMaterialObj = materials.find((m) => m.id === data.materialId);

      if (purchaseRequest?.id) {
        // For update, we only allow status change via separate action
        // This form is primarily for creating new requests
        onClose();
        return;
      }

      const requestData = {
        materialId: data.materialId,
        materialName: selectedMaterialObj?.name || '',
        quantity: data.quantity,
        unit: selectedMaterialObj?.unit || '',
        reason: data.reason,
        requestedBy: user?.name || user?.email || '',
      };

      await addPurchaseRequest(requestData);
      onClose();
    } catch (error: any) {
      console.error('Error saving purchase request:', error);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{purchaseRequest ? 'Xem đề xuất mua hàng' : 'Thêm đề xuất mua hàng'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="materialId"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    options={materials}
                    getOptionLabel={(option) => option ? option.name : ''}
                    value={materials.find((m) => m.id === field.value) || null}
                    onChange={(_, newValue) => field.onChange(newValue?.id || '')}
                    disabled={!!purchaseRequest}
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
                          option.name.toLowerCase().includes(searchValue) ||
                          (option.type || (option as any).category || '').toLowerCase().includes(searchValue)
                      );
                    }}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                  />
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
                    disabled={!!purchaseRequest}
                    value={field.value || ''}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      field.onChange(value);
                    }}
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
                    disabled={!!purchaseRequest}
                  />
                )}
              />
            </Grid>
            {purchaseRequest && (
              <>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Trạng thái</InputLabel>
                    <Select value={purchaseRequest.status} label="Trạng thái" disabled>
                      <MenuItem value="pending">Chờ duyệt</MenuItem>
                      <MenuItem value="approved">Đã duyệt</MenuItem>
                      <MenuItem value="rejected">Từ chối</MenuItem>
                      <MenuItem value="ordered">Đã đặt hàng</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {purchaseRequest.approvedBy && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Người duyệt"
                      value={purchaseRequest.approvedBy}
                      disabled
                    />
                  </Grid>
                )}
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Đóng</Button>
          {!purchaseRequest && (
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              Thêm
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
}

