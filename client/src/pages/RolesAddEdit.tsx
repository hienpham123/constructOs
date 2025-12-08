import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { Button, Input } from '../components/common';
import Breadcrumb from '../components/common/Breadcrumb';
import { rolesAPI } from '../services/api';
import { showSuccess, showError } from '../utils/notifications';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const PERMISSION_LABELS: Record<string, string> = {
  view_drawing: 'Xem hồ sơ bản vẽ',
  view_contract: 'Xem hợp đồng',
  view_report: 'Xem báo cáo',
  view_daily_report: 'Xem báo cáo ngày',
};

const roleSchema = z.object({
  name: z.string().min(1, 'Tên vai trò là bắt buộc'),
  description: z.string().optional(),
  permissions: z.object({
    view_drawing: z.boolean(),
    view_contract: z.boolean(),
    view_report: z.boolean(),
    view_daily_report: z.boolean(),
  }),
});

type RoleFormData = z.infer<typeof roleSchema>;

export default function RolesAddEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      description: '',
      permissions: {
        view_drawing: false,
        view_contract: false,
        view_report: false,
        view_daily_report: false,
      },
    },
  });

  useEffect(() => {
    const loadRole = async () => {
      if (isEditMode && id) {
        setIsLoading(true);
        try {
          const data = await rolesAPI.getById(id);
          // Set form values
          reset({
            name: data.name,
            description: data.description || '',
            permissions: data.permissions || {
              view_drawing: false,
              view_contract: false,
              view_report: false,
              view_daily_report: false,
            },
          });
        } catch (error: any) {
          showError(error.response?.data?.error || 'Không thể tải thông tin vai trò');
          navigate('/roles');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadRole();
  }, [isEditMode, id, navigate, reset]);

  const onSubmit = async (data: RoleFormData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (isEditMode && id) {
        await rolesAPI.update(id, data);
        showSuccess('Cập nhật vai trò thành công');
      } else {
        await rolesAPI.create(data);
        showSuccess('Tạo vai trò thành công');
      }
      navigate('/roles');
    } catch (error: any) {
      showError(error.response?.data?.error || 'Không thể lưu vai trò');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Breadcrumb
        items={[
          { label: 'Trang chủ', path: '/' },
          { label: 'Vai trò', path: '/roles' },
          { label: isEditMode ? 'Chỉnh sửa' : 'Thêm mới' },
        ]}
      />

      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={3}
        sx={{
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 },
          alignItems: { xs: 'stretch', sm: 'center' },
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {isEditMode ? 'Chỉnh sửa vai trò' : 'Thêm vai trò mới'}
        </Typography>
        <Box 
          display="flex" 
          gap={2}
          sx={{
            width: { xs: '100%', sm: 'auto' },
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          <Button
            variant="outlined"
            startIcon={<FontAwesomeIcon icon={faArrowLeft} />}
            onClick={() => navigate('/roles')}
            sx={{ 
              minHeight: '36px',
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            Quay lại
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<FontAwesomeIcon icon={faSave} />}
            disabled={isSubmitting}
            onClick={handleSubmit(onSubmit)}
            sx={{ 
              minHeight: '36px',
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    fullWidth
                    label="Tên vai trò"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    required
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    fullWidth
                    label="Mô tả"
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    multiline
                    rows={3}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Phân quyền truy cập
              </Typography>
              <Box
                sx={{
                  p: 2,
                  border: '1px solid #e5e7eb',
                  borderRadius: 0,
                  backgroundColor: '#f9fafb',
                }}
              >
                <Grid container spacing={2}>
                  {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                    <Grid item xs={12} sm={6} md={4} key={key}>
                      <Controller
                        name={`permissions.${key as keyof RoleFormData['permissions']}`}
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={field.value}
                                onChange={(e) => field.onChange(e.target.checked)}
                              />
                            }
                            label={label}
                          />
                        )}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}

