import { Popover, MenuList, MenuItem, ListItemText } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PushPinIcon from '@mui/icons-material/PushPin';
import DeleteIcon from '@mui/icons-material/Delete';
import type { GroupDetail } from '../../services/api/groupChats';
import { groupChatsAPI } from '../../services/api/groupChats';

interface GroupMenuPopoverProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  group: GroupDetail | null;
  groupId: string | undefined;
  currentUserId: string | undefined;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onGroupUpdate: (updatedGroup: GroupDetail) => void;
}

export default function GroupMenuPopover({
  open,
  anchorEl,
  onClose,
  group,
  groupId,
  currentUserId,
  onEditClick,
  onDeleteClick,
  onGroupUpdate,
}: GroupMenuPopoverProps) {
  const handlePinToggle = async () => {
    if (!groupId || !group) return;
    try {
      const result = await groupChatsAPI.togglePinGroup(groupId);
      onGroupUpdate({ ...group, pinned: result.pinned });
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Không thể thay đổi trạng thái ghim');
    }
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      sx={{
        '& .MuiPopover-paper': {
          boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
          borderRadius: '8px',
          minWidth: '200px',
          padding: '4px 0',
        },
      }}
    >
      <MenuList dense>
        <MenuItem
          onClick={() => {
            onClose();
            onEditClick();
          }}
        >
          <EditIcon sx={{ mr: 1, fontSize: 20 }} />
          <ListItemText>Chỉnh sửa nhóm</ListItemText>
        </MenuItem>
        <MenuItem onClick={handlePinToggle}>
          <PushPinIcon sx={{ mr: 1, fontSize: 20 }} />
          <ListItemText>{group?.pinned ? 'Bỏ ghim nhóm' : 'Ghim nhóm'}</ListItemText>
        </MenuItem>
        {group?.createdBy === currentUserId && (
          <MenuItem
            onClick={() => {
              onClose();
              onDeleteClick();
            }}
            sx={{ color: 'error.main' }}
          >
            <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
            <ListItemText>Xóa nhóm</ListItemText>
          </MenuItem>
        )}
      </MenuList>
    </Popover>
  );
}

