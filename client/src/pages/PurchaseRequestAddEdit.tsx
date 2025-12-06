import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  TextField,
  Grid,
  Autocomplete,
  Paper,
  Typography,
  Breadcrumbs,
  Link,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
} from '@mui/material';
import { Button } from '../components/common';
import HomeIcon from '@mui/icons-material/Home';
import SaveIcon from '@mui/icons-material/Save';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { PurchaseRequest } from '../types';
import { useMaterialStore } from '../stores/materialStore';
import { useAuthStore } from '../stores/authStore';
import { materialsAPI } from '../services/api';
import { normalizePurchaseRequest } from '../utils/normalize';

const purchaseRequestSchema = z.object({
  materialId: z.string().min(1, 'Vật tư là bắt buộc'),
  quantity: z.number().min(0.01, 'Số lượng phải > 0'),
  reason: z.string().min(1, 'Lý do là bắt buộc'),
});

type PurchaseRequestFormData = z.infer<typeof purchaseRequestSchema>;

export default function PurchaseRequestAddEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { purchaseRequests, fetchPurchaseRequests, materials, fetchMaterials, addPurchaseRequest } = useMaterialStore();
  const { user } = useAuthStore();
  const isSubmittingRef = useRef(false);
  const isEditMode = Boolean(id);
  const [purchaseRequest, setPurchaseRequest] = useState<PurchaseRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const requestId = isEditMode && id ? id : null;

  useEffect(() => {
    if (materials.length === 0) {
      fetchMaterials(1000, 0);
    }
  }, [materials.length, fetchMaterials]);

  // Fetch purchase request by ID when in edit mode
  useEffect(() => {
    const loadPurchaseRequest = async () => {
      if (isEditMode && requestId) {
        setIsLoading(true);
        try {
          // First check if it's already in store
          const foundInStore = purchaseRequests.find((r) => String(r.id) === String(requestId));
          if (foundInStore) {
            setPurchaseRequest(foundInStore);
            setIsLoading(false);
            return;
          }
          
          // If not in store, fetch by ID
          const data = await materialsAPI.getPurchaseRequestById(requestId);
          const normalized = normalizePurchaseRequest(data);
          setPurchaseRequest(normalized);
        } catch (error: any) {
          console.error('Error fetching purchase request:', error);
          setIsLoading(false);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadPurchaseRequest();
  }, [isEditMode, requestId, purchaseRequests]);

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
  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId);

  useEffect(() => {
    if (purchaseRequest) {
      reset({
        materialId: purchaseRequest.materialId || '',
        quantity: purchaseRequest.quantity || 0,
        reason: purchaseRequest.reason || '',
      });
    } else if (!isEditMode) {
      reset({
        materialId: '',
        quantity: 0,
        reason: '',
      });
    }
  }, [purchaseRequest, isEditMode, reset]);

  if (isEditMode && isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const onSubmit = async (data: PurchaseRequestFormData) => {
    if (isSubmittingRef.current || isSubmitting) {
      return;
    }

    isSubmittingRef.current = true;

    try {
      const selectedMaterialObj = materials.find((m) => m.id === data.materialId);

      if (purchaseRequest?.id) {
        // For update, we only allow status change via separate action
        navigate('/materials/purchase-requests');
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
      navigate('/materials/purchase-requests');
    } catch (error: any) {
      console.error('Error saving purchase request:', error);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const handleExit = () => {
    navigate('/materials/purchase-requests');
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            component="button"
            variant="body1"
            onClick={() => navigate('/')}
            sx={{ textDecoration: 'none', color: 'text.primary', cursor: 'pointer' }}
          >
            <HomeIcon sx={{ mr: 0.5, verticalAlign: 'middle', fontSize: 20 }} />
            Trang chủ
          </Link>
          <Link
            component="button"
            variant="body1"
            onClick={() => navigate('/materials/purchase-requests')}
            sx={{ textDecoration: 'none', color: 'text.primary', cursor: 'pointer' }}
          >
            Đề xuất mua hàng
          </Link>
          <Typography color="text.primary">
            {isEditMode ? 'Xem đề xuất mua hàng' : 'Thêm đề xuất mua hàng'}
          </Typography>
        </Breadcrumbs>
        
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {isEditMode ? 'Xem đề xuất mua hàng' : 'Thêm đề xuất mua hàng'}
          </Typography>
          <Box display="flex" gap={1}>
            {!isEditMode && (
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang lưu...' : 'Lưu dữ liệu'}
              </Button>
            )}
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

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
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
                        label="Vật tư *"
                        placeholder="Tìm kiếm vật tư..."
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
                    fullWidth
                    label="Số lượng *"
                    type="number"
                    inputProps={{ step: '0.01', min: '0.01' }}
                    error={!!errors.quantity}
                    helperText={errors.quantity?.message || (selectedMaterial ? `Đơn vị: ${selectedMaterial.unit}` : '')}
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
                    label="Lý do *"
                    multiline
                    rows={3}
                    error={!!errors.reason}
                    helperText={errors.reason?.message}
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
        </form>
      </Paper>
    </Box>
  );
}

