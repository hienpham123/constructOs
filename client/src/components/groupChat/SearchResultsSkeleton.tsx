import { Box, Skeleton } from '@mui/material';

export default function SearchResultsSkeleton() {
  return (
    <Box>
      <Skeleton variant="text" width={100} height={24} sx={{ mb: 1.5 }} />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {[1, 2, 3, 4, 5].map((item) => (
          <Box key={item} sx={{ display: 'flex', gap: 1.5, p: 1.5 }}>
            <Skeleton variant="circular" width={32} height={32} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Skeleton variant="text" width={120} height={20} />
                <Skeleton variant="text" width={60} height={16} />
              </Box>
              <Skeleton variant="text" width="100%" height={20} />
              <Skeleton variant="text" width="80%" height={20} />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

