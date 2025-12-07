import { useState } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Popover,
  Chip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ImageIcon from '@mui/icons-material/Image';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';

interface MessageInputProps {
  groupName: string;
  content: string;
  selectedFiles: File[];
  isSubmitting: boolean;
  textInputRef: React.RefObject<HTMLInputElement>;
  imageInputRef: React.RefObject<HTMLInputElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onContentChange: (value: string) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
  onSubmit: () => void;
}

export default function MessageInput({
  groupName,
  content,
  selectedFiles,
  isSubmitting,
  textInputRef,
  imageInputRef,
  fileInputRef,
  onContentChange,
  onFileSelect,
  onRemoveFile,
  onSubmit,
}: MessageInputProps) {
  const [emojiPickerAnchor, setEmojiPickerAnchor] = useState<HTMLElement | null>(null);

  const getFileIconForFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon />;
    } else if (file.type.includes('pdf')) {
      return <PictureAsPdfIcon />;
    } else if (file.type.includes('excel') || file.type.includes('spreadsheet')) {
      return <TableChartIcon />;
    }
    return <DescriptionIcon />;
  };

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
            onClick={(e) => setEmojiPickerAnchor(e.currentTarget)}
            sx={{
              color: '#65676b',
              '&:hover': {
                bgcolor: '#f0f2f5',
              },
            }}
          >
            <InsertEmoticonIcon fontSize="small" />
          </IconButton>
          <IconButton
            component="label"
            size="small"
            sx={{
              color: '#65676b',
              '&:hover': {
                bgcolor: '#f0f2f5',
              },
            }}
          >
            <ImageIcon fontSize="small" />
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
              color: '#65676b',
              '&:hover': {
                bgcolor: '#f0f2f5',
              },
            }}
          >
            <AttachFileIcon fontSize="small" />
            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              onChange={onFileSelect}
              accept="application/pdf,.doc,.docx,.xls,.xlsx,.csv"
            />
          </IconButton>
        </Box>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <Box sx={{ p: 1, bgcolor: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {selectedFiles.map((file, index) => (
                <Chip
                  key={index}
                  label={file.name}
                  onDelete={() => onRemoveFile(index)}
                  size="small"
                  icon={getFileIconForFile(file)}
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
          <TextField
            inputRef={textInputRef}
            fullWidth
            multiline
            maxRows={4}
            placeholder={`Nhập @, tin nhắn tới ${groupName}`}
            value={content || ''}
            onChange={(e) => {
              const newValue = e.target.value;
              onContentChange(newValue);
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (content.trim() || selectedFiles.length > 0) {
                  onSubmit();
                }
              }
            }}
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
                fontSize: '0.9375rem',
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
            onClick={onSubmit}
            disabled={isSubmitting || (!content.trim() && selectedFiles.length === 0)}
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
            {content.trim() || selectedFiles.length > 0 ? (
              <SendIcon fontSize="small" />
            ) : (
              <InsertEmoticonIcon fontSize="small" />
            )}
          </IconButton>
        </Box>
      </Box>

      {/* Emoji Picker */}
      <Popover
        open={Boolean(emojiPickerAnchor)}
        anchorEl={emojiPickerAnchor}
        onClose={() => setEmojiPickerAnchor(null)}
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
            onEmojiClick={(emojiData: EmojiClickData) => {
              onContentChange(content + emojiData.emoji);
              setEmojiPickerAnchor(null);
            }}
            width={350}
            height={400}
            previewConfig={{ showPreview: false }}
          />
        </Box>
      </Popover>
    </>
  );
}

