import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Grid,
  Autocomplete,
  Paper,
  Typography,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
} from '@mui/material';
import { Button, Input } from '../components/common';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSignOutAlt, faRefresh } from '@fortawesome/free-solid-svg-icons';
import { PurchaseRequest } from '../types';
import { useMaterialStore } from '../stores/materialStore';
import { useProjectStore } from '../stores/projectStore';
import { useAuthStore } from '../stores/authStore';
import { materialsAPI } from '../services/api';
import { normalizePurchaseRequest } from '../utils/normalize';
import PurchaseRequestCommentSection from '../components/PurchaseRequestCommentSection';
import { showError } from '../utils/notifications';
import Breadcrumb from '../components/common/Breadcrumb';
import { getPurchaseRequestStatusLabel, getPurchaseRequestStatusColor } from '../utils/statusHelpers';

const purchaseRequestSchema = z.object({
  materialId: z.string().min(1, 'Vật tư là bắt buộc'),
  quantity: z.number().min(0.01, 'Số lượng phải > 0'),
  reason: z.string().min(1, 'Lý do là bắt buộc'),
  projectId: z.string().optional(),
});

type PurchaseRequestFormData = z.infer<typeof purchaseRequestSchema>;

export default function PurchaseRequestAddEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { purchaseRequests, materials, fetchMaterials, addPurchaseRequest, updatePurchaseRequest } = useMaterialStore();
  const { projects, fetchProjects } = useProjectStore();
  const { user } = useAuthStore();
  const isSubmittingRef = useRef(false);
  const isEditMode = Boolean(id);
  const [purchaseRequest, setPurchaseRequest] = useState<PurchaseRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const requestId = isEditMode && id ? id : null;
  const canEdit = purchaseRequest && (purchaseRequest.status === 'pending' || purchaseRequest.status === 'rejected');
  const [tabValue, setTabValue] = useState(0);


  useEffect(() => {
    if (materials.length === 0) {
      fetchMaterials(1000, 0);
    }
  }, [materials.length, fetchMaterials]);

  useEffect(() => {
    if (projects.length === 0) {
      fetchProjects();
    }
  }, [projects.length, fetchProjects]);

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
      projectId: '',
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
        projectId: purchaseRequest.projectId || '',
      });
    } else if (!isEditMode) {
      reset({
        materialId: '',
        quantity: 0,
        reason: '',
        projectId: '',
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
        // Check if can edit (only if status is pending or rejected)
        if (purchaseRequest.status !== 'pending' && purchaseRequest.status !== 'rejected') {
          navigate('/materials/purchase-requests');
          return;
        }

        // Update purchase request
        await updatePurchaseRequest(purchaseRequest.id, {
          materialId: data.materialId,
          quantity: data.quantity,
          reason: data.reason,
          projectId: data.projectId || undefined,
        });
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
        projectId: data.projectId || undefined,
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

  const handleResubmit = async () => {
    if (!purchaseRequest || purchaseRequest.status !== 'rejected') {
      return;
    }

    try {
      await updatePurchaseRequest(purchaseRequest.id, {
        status: 'pending',
      });
      // Reload purchase request to get updated data
      if (requestId) {
        const data = await materialsAPI.getPurchaseRequestById(requestId);
        const normalized = normalizePurchaseRequest(data);
        setPurchaseRequest(normalized);
      }
    } catch (error: any) {
      console.error('Error resubmitting purchase request:', error);
      showError(error.message || 'Không thể gửi lại yêu cầu');
    }
  };

  return (
      <Box>
        <Box sx={{ mb: 3 }}>
          <Breadcrumb
            items={[
              { label: 'Trang chủ', path: '/' },
              { label: 'Đề xuất mua hàng', path: '/materials/purchase-requests' },
              {
                label: isEditMode 
                  ? (purchaseRequest && (purchaseRequest.status === 'pending' || purchaseRequest.status === 'rejected') 
                      ? 'Chỉnh sửa đề xuất mua hàng' 
                      : 'Xem đề xuất mua hàng')
                  : 'Thêm đề xuất mua hàng'
              },
            ]}
          />
        
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center"
          sx={{
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 0 },
            alignItems: { xs: 'stretch', sm: 'center' },
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {isEditMode 
              ? (purchaseRequest && (purchaseRequest.status === 'pending' || purchaseRequest.status === 'rejected') 
                  ? 'Chỉnh sửa đề xuất mua hàng' 
                  : 'Xem đề xuất mua hàng')
              : 'Thêm đề xuất mua hàng'}
          </Typography>
          <Box 
            display="flex" 
            gap={1}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              flexDirection: { xs: 'column', sm: 'row' },
            }}
          >
            {purchaseRequest && purchaseRequest.status === 'rejected' && (
              <Button
                variant="contained"
                color="warning"
                startIcon={<FontAwesomeIcon icon={faRefresh} />}
                onClick={handleResubmit}
                disabled={isSubmitting}
                sx={{
                  width: { xs: '100%', sm: 'auto' },
                }}
              >
                Gửi lại yêu cầu
              </Button>
            )}
            {(!isEditMode || canEdit) && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<FontAwesomeIcon icon={faSave} />}
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                sx={{
                  width: { xs: '100%', sm: 'auto' },
                }}
              >
                {isSubmitting ? 'Đang lưu...' : isEditMode ? 'Cập nhật' : 'Lưu'}
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<FontAwesomeIcon icon={faSignOutAlt} />}
              onClick={handleExit}
              sx={{
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              Thoát
            </Button>
          </Box>
        </Box>
      </Box>

      {isEditMode && purchaseRequest ? (
        <>
          <Paper sx={{ mt: 2 }}>
            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tab label="Thông tin" />
              <Tab label="Bình luận" />
            </Tabs>
            
            {tabValue === 0 && (
              <Box sx={{ p: 3 }}>
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
                            disabled={!canEdit && !!purchaseRequest}
                            renderInput={(params) => (
                              <Input
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
                          <Input
                            fullWidth
                            label="Số lượng *"
                            type="number"
                            inputProps={{ step: '0.01', min: '0.01' }}
                            error={!!errors.quantity}
                            helperText={errors.quantity?.message || (selectedMaterial ? `Đơn vị: ${selectedMaterial.unit}` : '')}
                            disabled={!canEdit && !!purchaseRequest}
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
                            getOptionLabel={(option) => option ? option.name : ''}
                            value={projects.find((p) => p.id === field.value) || null}
                            onChange={(_, newValue) => field.onChange(newValue?.id || '')}
                            disabled={!canEdit && !!purchaseRequest}
                            renderInput={(params) => (
                              <Input
                                {...params}
                                label="Dự án"
                                placeholder="Chọn dự án (tùy chọn)..."
                                error={!!errors.projectId}
                                helperText={errors.projectId?.message}
                              />
                            )}
                            filterOptions={(options, { inputValue }) => {
                              const searchValue = inputValue.toLowerCase();
                              return options.filter(
                                (option) =>
                                  option.name.toLowerCase().includes(searchValue) ||
                                  (option.name || '').toLowerCase().includes(searchValue)
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
                          <Input
                            {...field}
                            fullWidth
                            label="Lý do *"
                            multiline
                            rows={3}
                            error={!!errors.reason}
                            helperText={errors.reason?.message}
                            disabled={!canEdit && !!purchaseRequest}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box>
                        <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                          Trạng thái
                        </Typography>
                        <Chip
                          label={getPurchaseRequestStatusLabel(purchaseRequest.status)}
                          size="small"
                          sx={(() => {
                            const colors = getPurchaseRequestStatusColor(purchaseRequest.status);
                            return {
                              bgcolor: colors.bg,
                              color: colors.text,
                              '& .MuiChip-label': {
                                color: colors.text,
                              },
                            };
                          })()}
                        />
                      </Box>
                    </Grid>
                    {purchaseRequest.approvedBy && (
                      <Grid item xs={12} sm={6}>
                        <Input
                          fullWidth
                          label="Người duyệt"
                          value={purchaseRequest.approvedBy}
                          disabled
                        />
                      </Grid>
                    )}
                    {purchaseRequest.projectName && (
                      <Grid item xs={12} sm={6}>
                        <Input
                          fullWidth
                          label="Dự án"
                          value={purchaseRequest.projectName}
                          disabled
                        />
                      </Grid>
                    )}
                  </Grid>
                </form>
              </Box>
            )}
            
            {tabValue === 1 && (
              <Box sx={{ p: 2 }}>
                <PurchaseRequestCommentSection purchaseRequestId={purchaseRequest.id} />
              </Box>
            )}
          </Paper>
        </>
      ) : (
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
                      renderInput={(params) => (
                        <Input
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
                              <Input
                      fullWidth
                      label="Số lượng *"
                      type="number"
                      inputProps={{ step: '0.01', min: '0.01' }}
                      error={!!errors.quantity}
                      helperText={errors.quantity?.message || (selectedMaterial ? `Đơn vị: ${selectedMaterial.unit}` : '')}
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
                      getOptionLabel={(option) => option ? option.name : ''}
                      value={projects.find((p) => p.id === field.value) || null}
                      onChange={(_, newValue) => field.onChange(newValue?.id || '')}
                      renderInput={(params) => (
                        <Input
                          {...params}
                          label="Dự án"
                          placeholder="Chọn dự án (tùy chọn)..."
                          error={!!errors.projectId}
                          helperText={errors.projectId?.message}
                        />
                      )}
                      filterOptions={(options, { inputValue }) => {
                        const searchValue = inputValue.toLowerCase();
                        return options.filter(
                          (option) =>
                            option.name.toLowerCase().includes(searchValue) ||
                            (option.name || '').toLowerCase().includes(searchValue)
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
                              <Input
                      {...field}
                      fullWidth
                      label="Lý do *"
                      multiline
                      rows={3}
                      error={!!errors.reason}
                      helperText={errors.reason?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </form>
        </Paper>
      )}
    </Box>
  );
}

