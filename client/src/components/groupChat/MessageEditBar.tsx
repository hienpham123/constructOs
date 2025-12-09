import { useRef, useEffect, useState, useCallback, memo } from 'react';
import { Box, IconButton, Typography, Popover } from '@mui/material';
import { Input } from '../common';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimes, faSmile } from '@fortawesome/free-solid-svg-icons';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

interface MessageEditBarProps {
  editingContent: string;
  onContentChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  disabled?: boolean;
}

function MessageEditBar({
  editingContent,
  onContentChange,
  onSave,
  onCancel,
  disabled = false,
}: MessageEditBarProps) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const hasSetCursorRef = useRef(false);
  const [emojiPickerAnchor, setEmojiPickerAnchor] = useState<HTMLElement | null>(null);

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

  const handleEmojiClick = useCallback((emojiData: EmojiClickData) => {
    const newContent = editingContent + emojiData.emoji;
    onContentChange(newContent);
    setEmojiPickerAnchor(null);
    // Refocus input after emoji is inserted
    setTimeout(() => {
      const textarea = inputRef.current;
      if (textarea) {
        textarea.focus();
        const length = textarea.value.length;
        textarea.setSelectionRange(length, length);
      }
    }, 0);
  }, [editingContent, onContentChange]);

  const handleEmojiPickerOpen = useCallback((e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setEmojiPickerAnchor(e.currentTarget);
  }, []);

  const handleEmojiPickerClose = useCallback(() => {
    setEmojiPickerAnchor(null);
  }, []);

  return (
    <>
      <Box
        sx={{
          bgcolor: '#E8F4FD',
          borderTop: '1px solid #e4e6eb',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header with title and X button */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1,
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

        {/* Input Field with emoji and checkmark buttons */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            alignItems: 'flex-end',
            px: 2,
            pb: 2,
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
              borderRadius: '20px',
              '& .MuiOutlinedInput-root': {
                color: '#050505',
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
              '& .MuiInputBase-input': {
                color: '#050505',
                '&::placeholder': {
                  color: '#65676b',
                  opacity: 1,
                },
              },
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!disabled && editingContent.trim()) {
                  onSave();
                }
              } else if (e.key === 'Escape') {
                onCancel();
              }
            }}
          />
          <IconButton
            size="small"
            onClick={handleEmojiPickerOpen}
            sx={{
              color: '#1877f2',
              '&:hover': {
                bgcolor: '#e7f3ff',
              },
            }}
          >
            <FontAwesomeIcon icon={faSmile} style={{ fontSize: '20px' }} />
          </IconButton>
          <IconButton
            onClick={onSave}
            disabled={disabled || !editingContent.trim()}
            sx={{
              color: '#42b72a',
              bgcolor: 'transparent',
              '&:hover': {
                bgcolor: 'rgba(66, 183, 42, 0.1)',
              },
              '&.Mui-disabled': {
                color: 'rgba(0, 0, 0, 0.26)',
              },
            }}
          >
            <FontAwesomeIcon icon={faCheckCircle} style={{ fontSize: '20px' }} />
          </IconButton>
        </Box>
      </Box>

      {/* Emoji Picker */}
      <Popover
        open={Boolean(emojiPickerAnchor)}
        anchorEl={emojiPickerAnchor}
        onClose={handleEmojiPickerClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box sx={{ mt: -1 }}>
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            width={350}
            height={400}
            previewConfig={{ showPreview: false }}
          />
        </Box>
      </Popover>
    </>
  );
}

export default memo(MessageEditBar);
