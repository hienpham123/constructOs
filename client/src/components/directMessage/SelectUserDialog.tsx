import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  InputAdornment,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Input, Button } from '../common';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { usersAPI, type User } from '../../services/api/users';
import { useAuthStore } from '../../stores/authStore';

interface SelectUserDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectUser: (user: User) => void;
}

export default function SelectUserDialog({ open, onClose, onSelectUser }: SelectUserDialogProps) {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (open) {
      loadUsers();
    } else {
      setSearchTerm('');
    }
  }, [open]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll(100, 0);
      // Filter out current user
      const filteredUsers = response.data.filter((u: User) => u.id !== currentUser?.id);
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectUser = (user: User) => {
    onSelectUser(user);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: '12px',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Chọn người để trò chuyện
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #e4e6eb' }}>
          <Input
            fullWidth
            size="small"
            placeholder="Tìm kiếm theo tên hoặc email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FontAwesomeIcon icon={faSearch} style={{ fontSize: 18, color: '#8a8d91' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
                bgcolor: '#f0f2f5',
                '& fieldset': {
                  borderColor: 'transparent',
                },
              },
            }}
          />
        </Box>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : filteredUsers.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#65676b' }}>
              {searchTerm ? 'Không tìm thấy người dùng' : 'Không có người dùng nào'}
            </Typography>
          </Box>
        ) : (
          <List sx={{ maxHeight: 400, overflowY: 'auto', p: 0 }}>
            {filteredUsers.map((user) => (
              <ListItem key={user.id} disablePadding>
                <ListItemButton onClick={() => handleSelectUser(user)}>
                  <ListItemAvatar>
                    <Avatar
                      src={user.avatar || undefined}
                      sx={{
                        bgcolor: '#1877f2',
                        width: 48,
                        height: 48,
                      }}
                    >
                      {user.name[0]?.toUpperCase() || 'U'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={user.name}
                    secondary={user.email}
                    primaryTypographyProps={{
                      sx: { fontWeight: 500, fontSize: '0.9375rem' },
                    }}
                    secondaryTypographyProps={{
                      sx: { fontSize: '0.8125rem', color: '#65676b' },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: '1px solid #e4e6eb' }}>
        <Button onClick={onClose} variant="outlined" sx={{ textTransform: 'none' }}>
          Hủy
        </Button>
      </DialogActions>
    </Dialog>
  );
}

