import { Box, IconButton } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Input } from '../common';

interface MessageEditBarProps {
  content: string;
  onContentChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function MessageEditBar({ content, onContentChange, onSave, onCancel }: MessageEditBarProps) {
  return (
    <Box
      sx={{
        p: 1.5,
        bgcolor: '#fff3cd',
        borderTop: '1px solid #ffc107',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        width: '100%',
      }}
    >
      <Input
        fullWidth
        size="small"
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSave();
          } else if (e.key === 'Escape') {
            onCancel();
          }
        }}
        autoFocus
        sx={{
          '& .MuiOutlinedInput-root': {
            bgcolor: 'white',
          },
        }}
      />
      <IconButton
        size="small"
        onClick={onSave}
        sx={{
          color: '#28a745',
          '&:hover': {
            bgcolor: 'rgba(40, 167, 69, 0.1)',
          },
        }}
      >
        <FontAwesomeIcon icon={faCheck} />
      </IconButton>
      <IconButton
        size="small"
        onClick={onCancel}
        sx={{
          color: '#dc3545',
          '&:hover': {
            bgcolor: 'rgba(220, 53, 69, 0.1)',
          },
        }}
      >
        <FontAwesomeIcon icon={faTimes} />
      </IconButton>
    </Box>
  );
}

