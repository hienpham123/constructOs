import { useState, MouseEvent } from 'react';
import { IconButton, Popover, MenuList, MenuItem, ListItemText, Tooltip } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

interface ActionMenuProps {
  onView?: () => void;
  onEdit?: () => void;
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
    if (onEdit) {
      onEdit();
    }
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
        sx={{
          '& .MuiPopover-paper': {
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            borderRadius: '8px',
            minWidth: '150px',
            padding: '4px 0',
            bgcolor: '#ffffff',
            border: 'none',
          },
        }}
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
          {onView && (
            <MenuItem 
              onClick={handleView}
              sx={{
                '& .MuiListItemText-primary': {
                  color: '#000000',
                  fontSize: '14px',
                },
              }}
            >
              <ListItemText>{viewLabel}</ListItemText>
            </MenuItem>
          )}
          {onEdit && (
            <MenuItem 
              onClick={handleEdit}
              sx={{
                '& .MuiListItemText-primary': {
                  color: '#000000',
                  fontSize: '14px',
                },
              }}
            >
              <ListItemText>{editLabel}</ListItemText>
            </MenuItem>
          )}
          <MenuItem 
            onClick={handleDelete}
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
            <ListItemText>{deleteLabel}</ListItemText>
          </MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}

