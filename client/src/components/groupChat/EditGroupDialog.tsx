import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Avatar,
  IconButton,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';
import { groupChatsAPI, type GroupDetail, type GroupMember } from '../../services/api/groupChats';
import { useAuthStore } from '../../stores/authStore';
import PeoplePicker, { type PeoplePickerOption } from '../common/PeoplePicker';
import ConfirmDialog from '../common/ConfirmDialog';

interface EditGroupDialogProps {
  open: boolean;
  onClose: () => void;
  group: GroupDetail | null;
  onSuccess: () => void;
}

export default function EditGroupDialog({
  open,
  onClose,
  group,
  onSuccess,
}: EditGroupDialogProps) {
  const { user } = useAuthStore();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [deleteMemberDialogOpen, setDeleteMemberDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<GroupMember | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (group && open) {
      setName(group.name);
      setDescription(group.description || '');
      setAvatarPreview(group.avatar || null);
      loadGroup();
    }
  }, [group, open]);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddMember = async (member: PeoplePickerOption | null) => {
    if (!group || !member) return;
    try {
      await groupChatsAPI.addMembers(group.id, [member.id]);
      await loadGroup();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Không thể thêm thành viên');
    }
  };

  const handleRemoveMemberClick = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    if (member) {
      setMemberToDelete(member);
      setDeleteMemberDialogOpen(true);
    }
  };

  const handleRemoveMemberConfirm = async () => {
    if (!group || !memberToDelete) return;
    try {
      await groupChatsAPI.removeMember(group.id, memberToDelete.userId);
      await loadGroup();
      setMemberToDelete(null);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Không thể xóa thành viên');
    }
  };

  const loadGroup = async () => {
    if (!group) return;
    try {
      const updated = await groupChatsAPI.getGroupById(group.id);
      setMembers(updated.members || []);
    } catch (error) {
      console.error('Error loading group:', error);
    }
  };

  // Get member IDs to exclude from picker
  const excludeMemberIds = members.map((m) => m.userId);

  const handleSubmit = async () => {
    if (!name.trim() || !group) {
      alert('Vui lòng nhập tên nhóm');
      return;
    }

    try {
      setSubmitting(true);
      await groupChatsAPI.updateGroup(group.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        avatar: avatar || undefined,
      });
      handleClose();
      onSuccess();
    } catch (error: any) {
      console.error('Error updating group:', error);
      alert(error.response?.data?.error || 'Không thể cập nhật nhóm');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setAvatar(null);
    setAvatarPreview(null);
    setMembers([]);
    onClose();
  };

  const isOwnerOrAdmin = group?.members.find((m) => m.userId === user?.id)?.role === 'owner' || 
                         group?.members.find((m) => m.userId === user?.id)?.role === 'admin';

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth fullScreen={fullScreen}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">Chỉnh sửa nhóm</Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {/* Avatar */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={avatarPreview || undefined}
                sx={{ width: 100, height: 100, bgcolor: '#5C9CE6' }}
              >
                {name[0]?.toUpperCase() || 'G'}
              </Avatar>
              {isOwnerOrAdmin && (
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                  }}
                  size="small"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <PhotoCameraIcon fontSize="small" />
                </IconButton>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleAvatarSelect}
              />
            </Box>
          </Box>

          {/* Name */}
          <TextField
            label="Tên nhóm *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
            disabled={!isOwnerOrAdmin}
          />

          {/* Description */}
          <TextField
            label="Mô tả"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
            disabled={!isOwnerOrAdmin}
          />

          {/* Members */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Thành viên ({members.length})
            </Typography>
            <List dense>
              {members.map((member) => (
                <ListItem key={member.id}>
                  <ListItemAvatar>
                    <Avatar src={member.avatar || undefined} sx={{ bgcolor: '#5C9CE6' }}>
                      {member.name[0]?.toUpperCase() || 'U'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={member.name}
                    secondary={
                      <Chip
                        label={member.role === 'owner' ? 'Chủ nhóm' : member.role === 'admin' ? 'Quản trị' : 'Thành viên'}
                        size="small"
                        sx={{ height: 20, fontSize: '0.7rem', mt: 0.5 }}
                      />
                    }
                  />
                  {isOwnerOrAdmin && member.userId !== user?.id && member.role !== 'owner' && (
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => handleRemoveMemberClick(member.id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  )}
                </ListItem>
              ))}
            </List>

            {/* Add members */}
            {isOwnerOrAdmin && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Thêm thành viên
                </Typography>
                <PeoplePicker
                  label="Chọn thành viên để thêm"
                  placeholder="Chọn thành viên để thêm..."
                  multiple={false}
                  value={null}
                  onChange={(value) => {
                    handleAddMember(value as PeoplePickerOption | null);
                  }}
                  excludeIds={excludeMemberIds}
                  size="small"
                />
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={submitting}>
          Hủy
        </Button>
        {isOwnerOrAdmin && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!name.trim() || submitting}
          >
            {submitting ? 'Đang lưu...' : 'Lưu'}
          </Button>
        )}
      </DialogActions>

      <ConfirmDialog
        open={deleteMemberDialogOpen}
        onClose={() => {
          setDeleteMemberDialogOpen(false);
          setMemberToDelete(null);
        }}
        onConfirm={handleRemoveMemberConfirm}
        message="Bạn có chắc chắn muốn xóa thành viên này?"
        confirmButtonText="OK"
        cancelButtonText="Hủy"
        confirmButtonColor="error"
      />
    </Dialog>
  );
}

