import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert,
} from '@mui/material';
import { useAuthStore } from '../stores/authStore';

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
  allowedRoles?: string[];
}

export default function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Xác nhận xóa',
  message = 'Bạn có chắc chắn muốn xóa mục này?',
  itemName,
  allowedRoles,
}: DeleteConfirmDialogProps) {
  const { user } = useAuthStore();
  
  const hasPermission = allowedRoles 
    ? allowedRoles.includes(user?.role || '') 
    : true; // Nếu không chỉ định allowedRoles, cho phép mặc định (backward compatible)

  const handleConfirm = () => {
    if (hasPermission) {
      onConfirm();
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {!hasPermission ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            Bạn không có quyền thực hiện thao tác này. Vai trò của bạn: <strong>{user?.role}</strong>
          </Alert>
        ) : null}
        <DialogContentText>
          {itemName ? `${message} "${itemName}"?` : message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button 
          onClick={handleConfirm} 
          color="error" 
          variant="contained"
          disabled={!hasPermission}
        >
          Xóa
        </Button>
      </DialogActions>
    </Dialog>
  );
}

