import { Popover, MenuList, MenuItem, ListItemText } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faThumbtack, faTrash } from '@fortawesome/free-solid-svg-icons';
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
          bgcolor: '#ffffff',
          border: 'none',
        },
      }}
      disableRestoreFocus
    >
      <MenuList 
        dense
        sx={{
          padding: 0,
          '& .MuiMenuItem-root': {
            padding: '8px 16px',
            fontSize: '14px',
            minHeight: '36px',
            '&:hover': {
              bgcolor: '#f5f5f5',
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            onClose();
            onEditClick();
          }}
        >
          <FontAwesomeIcon 
            icon={faEdit} 
            style={{ 
              marginRight: 8, 
              fontSize: 20,
              color: '#65676b',
            }} 
          />
          <ListItemText>Chỉnh sửa nhóm</ListItemText>
        </MenuItem>
        <MenuItem onClick={handlePinToggle}>
          <FontAwesomeIcon 
            icon={faThumbtack} 
            style={{ 
              marginRight: 8, 
              fontSize: 20,
              color: '#65676b',
            }} 
          />
          <ListItemText>{group?.pinned ? 'Bỏ ghim nhóm' : 'Ghim nhóm'}</ListItemText>
        </MenuItem>
        {group?.createdBy === currentUserId && (
        <MenuItem
          onClick={() => {
            onClose();
            onDeleteClick();
          }}
          sx={{
            '& .MuiListItemText-primary': {
              color: '#d32f2f',
              fontSize: '14px',
            },
            '&:hover': {
              bgcolor: '#ffebee',
            },
          }}
        >
          <FontAwesomeIcon 
            icon={faTrash} 
            style={{ 
              marginRight: 8, 
              fontSize: 20,
              color: '#d32f2f',
            }} 
          />
          <ListItemText>Xóa nhóm</ListItemText>
        </MenuItem>
        )}
      </MenuList>
    </Popover>
  );
}

