import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Button } from '../common';

interface DeleteGroupDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  groupName: string | null;
}

export default function DeleteGroupDialog({ open, onClose, onConfirm, groupName }: DeleteGroupDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" fullScreen={fullScreen}>
      <DialogTitle>Xác nhận xóa nhóm</DialogTitle>
      <DialogContent>
        <Typography>
          Bạn có chắc chắn muốn xóa nhóm "{groupName}"? Tất cả tin nhắn và thành viên sẽ bị xóa. Hành động này không thể hoàn tác.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Xóa nhóm
        </Button>
      </DialogActions>
    </Dialog>
  );
}

