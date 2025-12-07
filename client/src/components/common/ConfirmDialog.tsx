import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Box,
} from '@mui/material';
import { Button } from './Button';

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonColor?: 'error' | 'success' | 'primary' | 'warning' | 'info';
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = 'OK',
  cancelButtonText = 'Hủy',
  confirmButtonColor = 'primary',
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  // Get site name from window.location or use default
  const siteName = typeof window !== 'undefined' 
    ? window.location.hostname || 'localhost'
    : 'localhost';

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: '8px',
          minWidth: '320px',
          maxWidth: '400px',
        },
      }}
    >
      {title ? (
        <DialogTitle
          sx={{
            fontSize: '1rem',
            fontWeight: 600,
            pb: 1.5,
            borderBottom: '1px solid #e4e6eb',
          }}
        >
          {title}
        </DialogTitle>
      ) : (
        <DialogTitle
          sx={{
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#65676b',
            pb: 1.5,
            borderBottom: '1px solid #e4e6eb',
          }}
        >
          {siteName} cho biết
        </DialogTitle>
      )}
      <DialogContent sx={{ py: 2.5, px: 2.5 }}>
        <DialogContentText
          sx={{
            fontSize: '0.9375rem',
            color: '#050505',
            lineHeight: 1.5,
            m: 0,
          }}
        >
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions
        sx={{
          px: 2.5,
          pb: 2,
          pt: 1.5,
          justifyContent: 'flex-end',
          gap: 1,
        }}
      >
        <Button
          onClick={onClose}
          variant="text"
          sx={{
            minWidth: 'auto',
            px: 2,
            py: 0.75,
            color: '#65676b',
            fontWeight: 500,
            textTransform: 'none',
            '&:hover': {
              bgcolor: '#f0f2f5',
            },
          }}
        >
          {cancelButtonText}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          sx={{
            minWidth: 'auto',
            px: 2.5,
            py: 0.75,
            bgcolor: confirmButtonColor === 'error' ? '#e41e3f' : '#8b5cf6',
            color: 'white',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: '6px',
            boxShadow: 'none',
            '&:hover': {
              bgcolor: confirmButtonColor === 'error' ? '#c91a35' : '#7c3aed',
              boxShadow: 'none',
            },
          }}
        >
          {confirmButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

