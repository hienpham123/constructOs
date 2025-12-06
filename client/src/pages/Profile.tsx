import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Grid,
  Avatar,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Button } from '../components/common';
import SaveIcon from '@mui/icons-material/Save';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { useAuthStore } from '../stores/authStore';
import { usersAPI } from '../services/api';
import { formatDate, formatDateTime } from '../utils/dateFormat';

export default function Profile() {
  const { user, updateUser, refreshUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setFetching(true);
        const data = await usersAPI.getCurrent();
        setUserData(data);
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
        });
      } catch (err: any) {
        console.error('Error fetching user data:', err);
        setError('Không thể tải thông tin người dùng');
        // Fallback to store data
        if (user) {
          setFormData({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
          });
        }
      } finally {
        setFetching(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');

    try {
      if (!user || !userData) {
        throw new Error('User not found');
      }

      const updated = await usersAPI.update(user.id, {
        name: formData.name,
        phone: formData.phone,
      });

      // Update user in store
      updateUser({
        name: updated.name,
        phone: updated.phone,
      });
      
      // Refresh full user data
      await refreshUser();
      
      setUserData(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.error || 'Cập nhật thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: { [key: string]: string } = {
      admin: 'Quản trị viên',
      project_manager: 'Quản lý dự án',
      accountant: 'Kế toán',
      warehouse: 'Kho',
      site_manager: 'Quản lý công trường',
      engineer: 'Kỹ sư',
      client: 'Khách hàng',
    };
    return labels[role] || role;
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      active: 'Hoạt động',
      inactive: 'Không hoạt động',
      banned: 'Bị cấm',
    };
    return labels[status] || status;
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước file không được vượt quá 5MB');
      return;
    }

    setUploadingAvatar(true);
    setError('');

    try {
      const response = await usersAPI.uploadAvatar(file);
      
      // Update user data
      setUserData(response.user);
      
      // Update user in store (for header avatar)
      updateUser({
        avatar: response.avatar,
      });
      
      // Refresh full user data to ensure consistency
      await refreshUser();
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      setError(err.response?.data?.error || 'Upload avatar thất bại. Vui lòng thử lại.');
    } finally {
      setUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (fetching) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (!user && !userData) {
    return (
      <Alert severity="error">Không thể tải thông tin người dùng</Alert>
    );
  }

  const displayUser = userData || user;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Hồ sơ của tôi
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: 'primary.main',
                  fontSize: 48,
                }}
                src={displayUser.avatar || undefined}
              >
                {displayUser.name?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleAvatarChange}
                disabled={uploadingAvatar}
              />
              <Tooltip title="Đổi avatar">
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  }}
                  onClick={handleAvatarClick}
                  disabled={uploadingAvatar}
                >
                  {uploadingAvatar ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <PhotoCameraIcon />
                  )}
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="h6">{displayUser.name}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {displayUser.email}
            </Typography>
            {displayUser.phone && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {displayUser.phone}
              </Typography>
            )}
            <Box sx={{ mt: 2, mb: 2 }}>
              <Chip
                label={getRoleLabel(displayUser.role)}
                color="primary"
                size="small"
                sx={{ mr: 1 }}
              />
              <Chip
                label={getStatusLabel(displayUser.status || 'active')}
                color={displayUser.status === 'active' ? 'success' : 'default'}
                size="small"
              />
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ textAlign: 'left', mt: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Ngày tạo: {displayUser.created_at ? formatDate(displayUser.created_at) : '-'}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                Cập nhật lần cuối: {displayUser.updated_at ? formatDateTime(displayUser.updated_at) : '-'}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Cập nhật thông tin thành công!
              </Alert>
            )}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Typography variant="h6" gutterBottom>
              Chỉnh sửa thông tin
            </Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Họ và tên"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Số điện thoại"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                    disabled={loading}
                  >
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

