import React from 'react';
import { Box, IconButton, Chip, Popover } from '@mui/material';
import { Input } from '../common';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faPaperclip, faSmile } from '@fortawesome/free-solid-svg-icons';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { getFileIcon } from '../../utils/fileHelpers';

interface CommentInputProps {
  content: string;
  selectedFiles: File[];
  isSubmitting: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onContentChange: (value: string) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
  onSubmit: () => void;
  placeholder?: string;
}

export default function CommentInput({
  content,
  selectedFiles,
  isSubmitting,
  fileInputRef,
  onContentChange,
  onFileSelect,
  onRemoveFile,
  onSubmit,
  placeholder = 'Nhập comment...',
}: CommentInputProps) {
  const [emojiPickerAnchor, setEmojiPickerAnchor] = React.useState<HTMLElement | null>(null);

  const handleEmojiClick = (event: React.MouseEvent<HTMLElement>) => {
    setEmojiPickerAnchor(event.currentTarget);
  };

  const handleEmojiPickerClose = () => {
    setEmojiPickerAnchor(null);
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    onContentChange(content + emojiData.emoji);
    setEmojiPickerAnchor(null);
  };

  return (
    <>
      <Box sx={{ bgcolor: 'white', borderTop: '1px solid #e0e0e0' }}>
        {/* Icon Row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1,
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <IconButton
            component="label"
            size="small"
            sx={{
              color: '#1976d2',
              '&:hover': {
                bgcolor: 'rgba(25, 118, 210, 0.08)',
              },
            }}
          >
            <FontAwesomeIcon icon={faPaperclip} style={{ fontSize: '16px' }} />
            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              onChange={onFileSelect}
              accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.csv"
            />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleEmojiClick}
            sx={{
              color: '#1976d2',
              '&:hover': {
                bgcolor: 'rgba(25, 118, 210, 0.08)',
              },
            }}
          >
            <FontAwesomeIcon icon={faSmile} style={{ fontSize: '16px' }} />
          </IconButton>
        </Box>
        {/* Input Field */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', px: 2, py: 1.5 }}>
          <Input
            fullWidth
            multiline
            maxRows={4}
            placeholder={placeholder}
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (content.trim() || selectedFiles.length > 0) {
                  onSubmit();
                }
              }
            }}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
                bgcolor: '#f5f5f5',
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
          />
          <IconButton
            onClick={onSubmit}
            disabled={isSubmitting || (!content.trim() && selectedFiles.length === 0)}
            sx={{
              color: '#1976d2',
              '&:hover': {
                bgcolor: 'rgba(25, 118, 210, 0.08)',
              },
              '&.Mui-disabled': {
                color: '#bdbdbd',
              },
            }}
          >
            <FontAwesomeIcon icon={faPaperPlane} style={{ fontSize: '16px' }} />
          </IconButton>
        </Box>
      </Box>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <Box sx={{ p: 1, bgcolor: '#f5f5f5', borderTop: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selectedFiles.map((file, index) => (
              <Chip
                key={index}
                label={file.name}
                onDelete={() => onRemoveFile(index)}
                size="small"
                icon={getFileIcon(file.type)}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Emoji Picker Popover */}
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
        sx={{
          '& .MuiPopover-paper': {
            boxShadow: 'none',
            bgcolor: 'transparent',
          },
        }}
      >
        <Box sx={{ mt: -1 }}>
          <EmojiPicker
            onEmojiClick={onEmojiClick}
            width={350}
            height={400}
            previewConfig={{ showPreview: false }}
          />
        </Box>
      </Popover>
    </>
  );
}

