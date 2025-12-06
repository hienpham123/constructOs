import { useState, MouseEvent, ReactNode } from 'react';
import { IconButton, Popover, MenuList, MenuItem, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface CustomAction {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  color?: 'default' | 'success' | 'error' | 'warning' | 'info';
}

interface ActionMenuWithCustomActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  customActions?: CustomAction[];
  viewLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
}

export default function ActionMenuWithCustomActions({
  onView,
  onEdit,
  onDelete,
  customActions = [],
  viewLabel = 'Xem chi tiết',
  editLabel = 'Chỉnh sửa',
  deleteLabel = 'Xóa',
}: ActionMenuWithCustomActionsProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (callback: () => void) => {
    callback();
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
          <MoreHorizIcon fontSize="small" />
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
          {customActions.map((action, index) => (
            <MenuItem
              key={index}
              onClick={() => handleAction(action.onClick)}
              sx={action.color === 'error' ? { color: 'error.main' } : action.color === 'success' ? { color: 'success.main' } : {}}
            >
              <ListItemIcon sx={action.color === 'error' ? { color: 'error.main' } : action.color === 'success' ? { color: 'success.main' } : {}}>
                {action.icon}
              </ListItemIcon>
              <ListItemText>{action.label}</ListItemText>
            </MenuItem>
          ))}
          {onView && (
            <MenuItem onClick={() => handleAction(onView)}>
              <ListItemIcon>
                <VisibilityIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{viewLabel}</ListItemText>
            </MenuItem>
          )}
          {onEdit && (
            <MenuItem onClick={() => handleAction(onEdit)}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{editLabel}</ListItemText>
            </MenuItem>
          )}
          {onDelete && (
            <MenuItem onClick={() => handleAction(onDelete)} sx={{ color: 'error.main' }}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
              </ListItemIcon>
              <ListItemText>{deleteLabel}</ListItemText>
            </MenuItem>
          )}
        </MenuList>
      </Popover>
    </>
  );
}

