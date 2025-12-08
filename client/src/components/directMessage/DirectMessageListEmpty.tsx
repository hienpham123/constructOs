import { Box, Typography } from '@mui/material';
import { Button } from '../common';

interface DirectMessageListEmptyProps {
  searchTerm: string;
  onStartChat: () => void;
}

export default function DirectMessageListEmpty({ searchTerm, onStartChat }: DirectMessageListEmptyProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        p: 4,
        textAlign: 'center',
      }}
    >
      {searchTerm ? (
        <>
          <Typography variant="h6" sx={{ mb: 1, color: '#65676b', fontWeight: 500 }}>
            Không tìm thấy cuộc trò chuyện
          </Typography>
          <Typography variant="body2" sx={{ color: '#8a8d91' }}>
            Không có cuộc trò chuyện nào phù hợp với "{searchTerm}"
          </Typography>
        </>
      ) : (
        <>
          <Typography variant="h6" sx={{ mb: 1, color: '#65676b', fontWeight: 500 }}>
            Chưa có cuộc trò chuyện nào
          </Typography>
          <Typography variant="body2" sx={{ color: '#8a8d91', mb: 2 }}>
            Bắt đầu trò chuyện với đồng nghiệp của bạn
          </Typography>
          <Button
            variant="contained"
            onClick={onStartChat}
            sx={{
              textTransform: 'none',
              bgcolor: '#1877f2',
              '&:hover': {
                bgcolor: '#166fe5',
              },
            }}
          >
            Bắt đầu trò chuyện
          </Button>
        </>
      )}
    </Box>
  );
}

