import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Button } from '../common';

interface DeleteMessageDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteMessageDialog({ open, onClose, onConfirm }: DeleteMessageDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" fullScreen={fullScreen}>
      <DialogTitle>Xác nhận xóa</DialogTitle>
      <DialogContent>
        <Typography>Bạn có chắc chắn muốn xóa tin nhắn này? Hành động này không thể hoàn tác.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Xóa
        </Button>
      </DialogActions>
    </Dialog>
  );
}

