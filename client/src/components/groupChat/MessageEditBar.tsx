import { useRef, useEffect } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { Input } from '../common';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimes } from '@fortawesome/free-solid-svg-icons';

interface MessageEditBarProps {
  editingContent: string;
  onContentChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  disabled?: boolean;
}

export default function MessageEditBar({
  editingContent,
  onContentChange,
  onSave,
  onCancel,
  disabled = false,
}: MessageEditBarProps) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const hasSetCursorRef = useRef(false);

  useEffect(() => {
    // Focus input and set cursor to end only once when component first mounts
    if (!hasSetCursorRef.current) {
      // Use setTimeout to ensure textarea is fully rendered
      setTimeout(() => {
        const textarea = inputRef.current;
        if (textarea) {
          textarea.focus();
          // Set cursor to end of text only on first mount
          const length = textarea.value.length;
          textarea.setSelectionRange(length, length);
          hasSetCursorRef.current = true;
        }
      }, 0);
    }
  }, []); // Empty dependency array - only run once on mount

  return (
    <Box
      sx={{
        bgcolor: '#E8F4FD',
        borderTop: '1px solid #e4e6eb',
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
            color: '#1877f2',
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
            color: '#1877f2',
            '&:hover': {
              bgcolor: 'rgba(24, 119, 242, 0.1)',
            },
          }}
        >
          <FontAwesomeIcon icon={faTimes} style={{ fontSize: '16px' }} />
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
        <Input
          fullWidth
          multiline
          maxRows={4}
          value={editingContent}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="Nhập tin nhắn..."
          size="small"
          inputRef={(ref: HTMLTextAreaElement) => {
            inputRef.current = ref;
          }}
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
              if (!disabled && editingContent) {
                onSave();
              }
            }
          }}
        />
        <IconButton
          onClick={onSave}
          disabled={disabled}
          sx={{
            color: '#42b72a',
            bgcolor: 'transparent',
            '&:hover': {
              bgcolor: 'rgba(66, 183, 42, 0.1)',
            },
            '&.Mui-disabled': {
              color: 'rgba(0,0,0,0.26)',
            },
          }}
        >
          <FontAwesomeIcon icon={faCheckCircle} />
        </IconButton>
      </Box>
    </Box>
  );
}

