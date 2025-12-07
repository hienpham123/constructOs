import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText as MuiListItemText,
  Avatar,
  Chip,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { GroupDetail } from '../../services/api/groupChats';

interface MembersDialogProps {
  open: boolean;
  onClose: () => void;
  group: GroupDetail | null;
}

export default function MembersDialog({ open, onClose, group }: MembersDialogProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth 
      PaperProps={{
        sx: {
          maxHeight: isMobile ? '90vh' : '85vh',
          m: isMobile ? 1 : 2,
          width: isMobile ? 'calc(100% - 16px)' : 'auto',
          minWidth: isMobile ? 'auto' : '500px',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Thành viên nhóm
        </Typography>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ color: '#65676b' }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <List sx={{ py: 0 }}>
          {group?.members.map((member) => (
            <ListItem key={member.id} sx={{ px: 2, py: 1.5 }}>
              <ListItemAvatar>
                <Avatar src={member.avatar || undefined} sx={{ bgcolor: '#5C9CE6' }}>
                  {member.name[0]?.toUpperCase() || 'U'}
                </Avatar>
              </ListItemAvatar>
              <MuiListItemText
                primary={member.name}
                secondary={
                  <Box>
                    <Typography variant="caption" display="block">
                      {member.email}
                    </Typography>
                    <Chip
                      label={member.role === 'owner' ? 'Chủ nhóm' : member.role === 'admin' ? 'Quản trị' : 'Thành viên'}
                      size="small"
                      sx={{ mt: 0.5, height: 20, fontSize: '0.7rem' }}
                    />
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      {!isMobile && (
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button onClick={onClose}>Đóng</Button>
        </DialogActions>
      )}
    </Dialog>
  );
}

