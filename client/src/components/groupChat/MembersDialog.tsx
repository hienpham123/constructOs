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
} from '@mui/material';
import type { GroupDetail } from '../../services/api/groupChats';

interface MembersDialogProps {
  open: boolean;
  onClose: () => void;
  group: GroupDetail | null;
}

export default function MembersDialog({ open, onClose, group }: MembersDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Thành viên nhóm</DialogTitle>
      <DialogContent>
        <List>
          {group?.members.map((member) => (
            <ListItem key={member.id}>
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
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}

