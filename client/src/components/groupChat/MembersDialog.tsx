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
  Box,
  Typography,
  useMediaQuery,
  useTheme,
  IconButton,
  Divider,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
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
          <FontAwesomeIcon icon={faTimes} style={{ fontSize: '16px' }} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0, maxHeight: '60vh', overflowY: 'auto' }}>
        <List sx={{ py: 0 }}>
          {group?.members.map((member, index) => (
            <Box key={member.id}>
              <ListItem 
                sx={{ 
                  px: 2, 
                  py: 1.5,
                  '&:hover': {
                    bgcolor: '#f0f2f5',
                  },
                }}
              >
                <ListItemAvatar sx={{ minWidth: 48 }}>
                  <Avatar 
                    src={member.avatar || undefined} 
                    sx={{ 
                      width: 40,
                      height: 40,
                      bgcolor: '#1877f2',
                      fontSize: '0.875rem',
                    }}
                  >
                    {member.name[0]?.toUpperCase() || 'U'}
                  </Avatar>
                </ListItemAvatar>
                <MuiListItemText
                  primary={
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        fontSize: '0.9375rem',
                        color: '#050505',
                        mb: 0.25,
                      }}
                    >
                      {member.name}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Typography 
                        variant="caption" 
                        sx={{
                          display: 'block',
                          color: '#65676b',
                          fontSize: '0.8125rem',
                          mb: 0.5,
                        }}
                      >
                        {member.email}
                      </Typography>
                      <Box
                        component="span"
                        sx={{
                          display: 'inline-block',
                          px: 1.5,
                          py: 0.25,
                          borderRadius: '4px',
                          bgcolor: '#e4e6eb',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          color: '#65676b',
                        }}
                      >
                        {member.role === 'owner' ? 'Chủ nhóm' : member.role === 'admin' ? 'Quản trị' : 'Thành viên'}
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
              {index < (group?.members.length || 0) - 1 && <Divider sx={{ mx: 2 }} />}
            </Box>
          ))}
        </List>
      </DialogContent>
      <DialogActions sx={{ px: 2, py: 1.5, borderTop: '1px solid #e4e6eb' }}>
        <Button 
          onClick={onClose}
          variant="contained"
          color="primary"
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
          }}
        >
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}

