import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  Alert,
} from '@mui/material';
import { Button, Input } from '../components/common';
import { authAPI } from '../services/api';
import logoImage from '../images/logo.svg';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }

    setLoading(true);

    try {
      await authAPI.forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra. Vui lòng thử lại.');
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
      <Container component="main" maxWidth="xs">
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
            Quên mật khẩu
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
            Nhập email để nhận link đặt lại mật khẩu
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
              {success && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: 1 }}>
                  Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu. Vui lòng kiểm tra email.
                </Alert>
              )}
              <Input
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={success}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1,
                  },
                }}
              />
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
                disabled={loading || success}
              >
                {loading ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
              </Button>
              <Typography variant="body2" color="text.secondary" align="center">
                <Link
                  to="/login"
                  style={{
                    textDecoration: 'none',
                    color: '#dc2626',
                    fontWeight: 600,
                  }}
                >
                  Quay lại đăng nhập
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}

