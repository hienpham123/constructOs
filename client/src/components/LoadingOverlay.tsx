import { Backdrop, CircularProgress, Box, Typography } from '@mui/material';
import { useLoadingStore } from '../stores/loadingStore';

export default function LoadingOverlay() {
  const isLoading = useLoadingStore((state) => state.isLoading);

  if (!isLoading) return null;

  return (
    <Backdrop
      open={isLoading}
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <CircularProgress color="inherit" size={60} thickness={4} />
        <Typography variant="body1" sx={{ color: 'white', fontWeight: 500 }}>
          Đang tải...
        </Typography>
      </Box>
    </Backdrop>
  );
}

