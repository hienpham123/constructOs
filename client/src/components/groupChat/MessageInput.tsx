import { useState, useCallback, useRef, memo } from 'react';
import {
  Box,
  IconButton,
  Popover,
  Chip,
} from '@mui/material';
import { Input } from '../common';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faPaperclip, faSmile, faImage } from '@fortawesome/free-solid-svg-icons';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { getFileIcon } from '../../utils/fileHelpers';

interface MessageInputProps {
  groupName: string;
  content: string;
  selectedFiles: File[];
  textInputRef: React.RefObject<HTMLInputElement>;
  imageInputRef: React.RefObject<HTMLInputElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onContentChange: (value: string) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
  onSubmit: () => void;
}

function MessageInput({
  groupName,
  content,
  selectedFiles,
  textInputRef,
  imageInputRef,
  fileInputRef,
  onContentChange,
  onFileSelect,
  onRemoveFile,
  onSubmit,
}: MessageInputProps) {
  const [emojiPickerAnchor, setEmojiPickerAnchor] = useState<HTMLElement | null>(null);
  
  // Optimized content change handler - no debounce to maintain immediate feedback
  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onContentChange(e.target.value);
  }, [onContentChange]);
  
  const handleEmojiClick = useCallback((emojiData: EmojiClickData) => {
    const newContent = content + emojiData.emoji;
    onContentChange(newContent);
    setEmojiPickerAnchor(null);
  }, [content, onContentChange]);
  
  const handleEmojiPickerOpen = useCallback((e: React.MouseEvent<HTMLElement>) => {
    setEmojiPickerAnchor(e.currentTarget);
  }, []);
  
  const handleEmojiPickerClose = useCallback(() => {
    setEmojiPickerAnchor(null);
  }, []);
  
  const handleSubmit = useCallback(() => {
    if (content || selectedFiles.length > 0) {
      onSubmit();
    }
  }, [content, selectedFiles.length, onSubmit]);
  
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);
  
  const handleFileRemove = useCallback((index: number) => {
    onRemoveFile(index);
  }, [onRemoveFile]);


  return (
    <>
      <Box sx={{ bgcolor: 'white', borderTop: '1px solid #e4e6eb' }}>
        {/* Icon Row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1.5,
            py: 0.5,
            borderBottom: '1px solid #e4e6eb',
          }}
        >
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
            component="label"
            size="small"
            sx={{
              color: '#1877f2',
              '&:hover': {
                bgcolor: '#e7f3ff',
              },
            }}
          >
            <FontAwesomeIcon icon={faImage} style={{ fontSize: '20px' }} />
            <input
              ref={imageInputRef}
              type="file"
              multiple
              hidden
              onChange={onFileSelect}
              accept="image/*"
            />
          </IconButton>
          <IconButton
            component="label"
            size="small"
            sx={{
              color: '#1877f2',
              '&:hover': {
                bgcolor: '#e7f3ff',
              },
            }}
          >
            <FontAwesomeIcon icon={faPaperclip} style={{ fontSize: '20px' }} />
            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              onChange={onFileSelect}
              accept="*/*"
            />
          </IconButton>
        </Box>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <Box sx={{ p: 1, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {selectedFiles.map((file, index) => (
                <Chip
                  key={`${file.name}-${index}`}
                  label={file.name}
                  onDelete={() => handleFileRemove(index)}
                  size="small"
                  icon={getFileIcon(file.type)}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Input Field */}
        <Box
          sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', px: 1.5, py: 1 }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Input
            inputRef={textInputRef}
            fullWidth
            multiline
            maxRows={4}
            placeholder={`Nhập @, tin nhắn tới ${groupName}`}
            value={content || ''}
            onChange={handleContentChange}
            onKeyPress={handleKeyPress}
            onClick={(e) => {
              e.stopPropagation();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onFocus={(e) => {
              e.stopPropagation();
              const input = e.target as HTMLInputElement;
              if (input && content) {
                if (input.value !== content) {
                  input.value = content;
                }
              }
            }}
            inputProps={{
              style: { color: '#050505' },
            }}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
                fontSize: '1rem', // 16px to prevent zoom on iOS Safari
                color: '#050505',
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover fieldset': {
                  borderColor: 'transparent',
                },
                '&.Mui-focused': {
                  bgcolor: 'white',
                  '& fieldset': {
                    borderColor: 'transparent',
                  },
                },
              },
              '& .MuiInputBase-input': {
                color: '#050505',
                '&::placeholder': {
                  color: '#65676b',
                  opacity: 1,
                },
                '&:focus': {
                  outline: 'none',
                  color: '#050505',
                },
              },
            }}
          />
          <IconButton
            onClick={handleSubmit}
            disabled={!content && selectedFiles.length === 0}
            sx={{
              color: '#1877f2',
              '&:hover': {
                bgcolor: '#e7f3ff',
              },
              '&.Mui-disabled': {
                color: '#bcc0c4',
              },
            }}
          >
            {content || selectedFiles.length > 0 ? (
              <FontAwesomeIcon icon={faPaperPlane} style={{ fontSize: '16px' }} />
            ) : (
              <FontAwesomeIcon icon={faSmile} style={{ fontSize: '16px' }} />
            )}
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

export default memo(MessageInput);

