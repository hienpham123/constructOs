import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  Alert,
  MenuItem,
  Grid,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Button, Input } from '../components/common';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useAuthStore } from '../stores/authStore';
import logoImage from '../images/logo.svg';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'client',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuthStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);

    try {
      await register(
        formData.name,
        formData.email,
        formData.password,
        formData.phone || undefined,
        formData.role
      );
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 50%, #fef2f2 100%)',
        py: 4,
      }}
    >
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 120,
              height: 120,
              borderRadius: 2,
              background: '#ffffff',
              boxShadow: '0px 8px 24px rgba(220, 38, 38, 0.15)',
              p: 2,
            }}
          >
            <img
              src={logoImage}
              alt="Logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </Box>
          <Typography
            component="h1"
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 0.5,
              background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Đăng ký
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Tạo tài khoản mới để bắt đầu
          </Typography>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              width: '100%',
              border: '1px solid rgba(220, 38, 38, 0.1)',
              borderRadius: 2,
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
              background: '#ffffff',
            }}
          >
            <Box component="form" onSubmit={handleSubmit}>
              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }}>
                  {error}
                </Alert>
              )}
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Input
                    required
                    fullWidth
                    id="name"
                    label="Họ và tên"
                    name="name"
                    autoComplete="name"
                    autoFocus
                    value={formData.name}
                    onChange={handleChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Input
                    required
                    fullWidth
                    id="email"
                    label="Email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Input
                    fullWidth
                    id="phone"
                    label="Số điện thoại"
                    name="phone"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Input
                    required
                    fullWidth
                    id="role"
                    select
                    label="Vai trò"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                      },
                    }}
                  >
                    <MenuItem value="client">Khách hàng</MenuItem>
                    <MenuItem value="engineer">Kỹ sư</MenuItem>
                    <MenuItem value="site_manager">Quản lý công trường</MenuItem>
                    <MenuItem value="warehouse">Kho</MenuItem>
                    <MenuItem value="accountant">Kế toán</MenuItem>
                    <MenuItem value="project_manager">Quản lý dự án</MenuItem>
                    <MenuItem value="admin">Quản trị viên</MenuItem>
                  </Input>
                </Grid>
                <Grid item xs={12}>
                  <Input
                    required
                    fullWidth
                    name="password"
                    label="Mật khẩu"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    helperText="Tối thiểu 6 ký tự"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Input
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Xác nhận mật khẩu"
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 1,
                  background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
                  boxShadow: '0px 4px 12px rgba(220, 38, 38, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
                    boxShadow: '0px 6px 16px rgba(220, 38, 38, 0.4)',
                  },
                }}
                disabled={loading}
              >
                {loading ? 'Đang đăng ký...' : 'Đăng ký'}
              </Button>
              <Typography variant="body2" color="text.secondary" align="center">
                Đã có tài khoản?{' '}
                <Link
                  to="/login"
                  style={{
                    textDecoration: 'none',
                    color: '#dc2626',
                    fontWeight: 600,
                  }}
                >
                  Đăng nhập
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}

