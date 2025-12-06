import { useState, MouseEvent } from 'react';
import { IconButton, Popover, MenuList, MenuItem, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface ActionMenuProps {
  onView?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  viewLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
}

export default function ActionMenu({
  onView,
  onEdit,
  onDelete,
  viewLabel = 'Xem chi tiết',
  editLabel = 'Chỉnh sửa',
  deleteLabel = 'Xóa',
}: ActionMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleView = () => {
    if (onView) {
      onView();
    }
    handleClose();
  };

  const handleEdit = () => {
    onEdit();
    handleClose();
  };

  const handleDelete = () => {
    onDelete();
    handleClose();
  };

  return (
    <>
      <Tooltip title="Thao tác">
        <IconButton
          size="small"
          onClick={handleClick}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuList dense>
          {onView && (
            <MenuItem onClick={handleView}>
              <ListItemIcon>
                <VisibilityIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{viewLabel}</ListItemText>
            </MenuItem>
          )}
          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{editLabel}</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
            </ListItemIcon>
            <ListItemText>{deleteLabel}</ListItemText>
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}

