import { Box, TextField, IconButton, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';

interface CommentEditBarProps {
  editingContent: string;
  onContentChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  disabled?: boolean;
}

export default function CommentEditBar({
  editingContent,
  onContentChange,
  onSave,
  onCancel,
  disabled = false,
}: CommentEditBarProps) {
  return (
    <Box
      sx={{
        bgcolor: '#E8F4FD',
        borderTop: '1px solid #e0e0e0',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Edit Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1,
          bgcolor: '#E8F4FD',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: '#1976d2',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          Chỉnh sửa tin nhắn
        </Typography>
        <IconButton
          size="small"
          onClick={onCancel}
          sx={{
            color: '#1976d2',
            '&:hover': {
              bgcolor: 'rgba(25, 118, 210, 0.1)',
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      {/* Edit Input */}
      <Box
        sx={{
          px: 2,
          pb: 2,
          display: 'flex',
          gap: 1,
          alignItems: 'flex-end',
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={editingContent}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="Nhập tin nhắn..."
          size="small"
          sx={{
            bgcolor: '#ffffff',
            borderRadius: 1,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'transparent',
              },
              '&:hover fieldset': {
                borderColor: 'transparent',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'transparent',
              },
            },
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (!disabled) {
                onSave();
              }
            }
          }}
        />
        <IconButton
          onClick={onSave}
          disabled={disabled}
          sx={{
            color: '#4CAF50',
            bgcolor: 'transparent',
            '&:hover': {
              bgcolor: 'rgba(76, 175, 80, 0.1)',
            },
            '&.Mui-disabled': {
              color: 'rgba(255,255,255,0.3)',
            },
          }}
        >
          <CheckCircleIcon />
        </IconButton>
      </Box>
    </Box>
  );
}

