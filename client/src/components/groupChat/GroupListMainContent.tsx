import { Box, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers } from '@fortawesome/free-solid-svg-icons';

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
        <FontAwesomeIcon icon={faUsers} style={{ fontSize: 96, color: '#ccc', marginBottom: 16 }} />
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
