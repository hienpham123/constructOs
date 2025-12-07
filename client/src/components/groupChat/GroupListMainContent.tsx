import { Box, Typography } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';

export default function GroupListMainContent() {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f0f2f5',
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <GroupIcon sx={{ fontSize: 96, color: '#ccc', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Chọn một nhóm để bắt đầu chat
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Hoặc tạo nhóm mới để bắt đầu cuộc trò chuyện
        </Typography>
      </Box>
    </Box>
  );
}
