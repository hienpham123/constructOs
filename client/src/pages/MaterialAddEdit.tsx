import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  TextField,
  Grid,
  Paper,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Button } from '../components/common';
import Breadcrumb from '../components/common/Breadcrumb';
import { Material } from '../types';
import { useMaterialStore } from '../stores/materialStore';
import { materialsAPI } from '../services/api';
import { normalizeMaterial } from '../utils/normalize';
import { formatCurrencyInput, parseCurrencyInput } from '../utils/currencyFormat';
import { normalizeNumber } from '../utils/normalize';
import SaveIcon from '@mui/icons-material/Save';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

const materialSchema = z.object({
  name: z.string().min(1, 'Tên vật tư là bắt buộc'),
  type: z.string().min(1, 'Chủng loại là bắt buộc'),
  unit: z.string().min(1, 'Đơn vị là bắt buộc'),
  currentStock: z.number().min(0, 'Tồn kho phải >= 0'),
  importPrice: z.number().min(0, 'Đơn giá nhập phải >= 0'),
  supplier: z.string().optional(),
});

type MaterialFormData = z.infer<typeof materialSchema>;

export default function MaterialAddEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { materials, addMaterial, updateMaterial } = useMaterialStore();
  const isSubmittingRef = useRef(false);
  const isEditMode = Boolean(id);
  const [material, setMaterial] = useState<Material | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const materialId = isEditMode && id ? id : null;
  
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

  // Fetch material by ID when in edit mode
  useEffect(() => {
    const loadMaterial = async () => {
      if (isEditMode && materialId) {
        setIsLoading(true);
        try {
          // First check if it's already in store
          const foundInStore = materials.find((m) => String(m.id) === String(materialId));
          if (foundInStore) {
            setMaterial(foundInStore);
            setIsLoading(false);
            return;
          }
          
          // If not in store, fetch by ID
          const data = await materialsAPI.getById(materialId);
          const normalized = normalizeMaterial(data);
          setMaterial(normalized);
        } catch (error: any) {
          console.error('Error fetching material:', error);
          setIsLoading(false);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadMaterial();
  }, [isEditMode, materialId, materials]);

  useEffect(() => {
    if (material) {
      reset({
        name: material.name || '',
        type: material.type || (material as any).category || '',
        unit: material.unit || '',
        currentStock: normalizeNumber(material.currentStock || (material as any).current_stock),
        importPrice: normalizeNumber(material.importPrice || (material as any).import_price || (material as any).unit_price),
        supplier: material.supplier || '',
      });
    } else if (!isEditMode) {
      reset({
        name: '',
        type: '',
        unit: '',
        currentStock: 0,
        importPrice: 0,
        supplier: '',
      });
    }
  }, [material, isEditMode, reset]);

  const onSubmit = async (data: MaterialFormData) => {
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

      if (isEditMode && id) {
        await updateMaterial(id, materialData);
      } else {
        await addMaterial(materialData);
      }
      
      navigate('/materials/list');
    } catch (error: any) {
      console.error('Error saving material:', error);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const handleExit = () => {
    navigate('/materials/list');
  };

  if (isEditMode && isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header với breadcrumb và buttons */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumb
          items={[
            { label: 'Trang chủ', path: '/' },
            { label: 'Vật tư', path: '/materials/list' },
            { label: isEditMode ? 'Chỉnh sửa vật tư' : 'Thêm vật tư mới' },
          ]}
        />
        
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {isEditMode ? 'Chỉnh sửa vật tư' : 'Thêm vật tư mới'}
          </Typography>
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu dữ liệu'}
            </Button>
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

      {/* Form content */}
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Tên vật tư *"
                    error={!!errors.name}
                    helperText={errors.name?.message}
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
                    label="Chủng loại *"
                    error={!!errors.type}
                    helperText={errors.type?.message}
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
                    label="Đơn vị *"
                    error={!!errors.unit}
                    helperText={errors.unit?.message}
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
                    label="Tồn kho *"
                    error={!!errors.currentStock}
                    helperText={errors.currentStock?.message}
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
                    label="Đơn giá nhập (VND) *"
                    error={!!errors.importPrice}
                    helperText={errors.importPrice?.message}
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
        </form>
      </Paper>
    </Box>
  );
}

