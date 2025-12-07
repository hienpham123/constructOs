import { useState, useRef } from 'react';
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
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { groupChatsAPI } from '../../services/api/groupChats';
import PeoplePicker, { type PeoplePickerOption } from '../common/PeoplePicker';

interface CreateGroupDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateGroupDialog({
  open,
  onClose,
  onSuccess,
}: CreateGroupDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<PeoplePickerOption[]>([]);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert('Vui lòng nhập tên nhóm');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('name', name.trim());
      if (description.trim()) {
        formData.append('description', description.trim());
      }
      if (selectedMembers.length > 0) {
        selectedMembers.forEach((member) => {
          formData.append('memberIds[]', member.id);
        });
      }
      if (avatar) {
        formData.append('avatar', avatar);
      }

      await groupChatsAPI.createGroup({
        name: name.trim(),
        description: description.trim() || undefined,
        memberIds: selectedMembers.map((m) => m.id),
        avatar: avatar || undefined,
      });
      handleClose();
      onSuccess();
    } catch (error: any) {
      console.error('Error creating group:', error);
      alert(error.response?.data?.error || 'Không thể tạo nhóm');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setSelectedMembers([]);
    setAvatar(null);
    setAvatarPreview(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth fullScreen={fullScreen}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">Tạo nhóm chat mới</Typography>
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
          />

          {/* Description */}
          <TextField
            label="Mô tả"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={3}
          />

          {/* Members */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Thêm thành viên
            </Typography>
            <PeoplePicker
              label="Chọn thành viên"
              placeholder="Chọn thành viên..."
              multiple
              value={selectedMembers}
              onChange={(value) => setSelectedMembers(value as PeoplePickerOption[])}
              size="small"
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={submitting}>
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!name.trim() || submitting}
        >
          {submitting ? 'Đang tạo...' : 'Tạo nhóm'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

