import { useState, MouseEvent, ReactNode } from 'react';
import { IconButton, Popover, MenuList, MenuItem, ListItemText, Tooltip } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';

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
          <FontAwesomeIcon icon={faEllipsisH} style={{ fontSize: '16px' }} />
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
              onClick={() => handleAction(onView!)}
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
              onClick={() => handleAction(onEdit!)}
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
          {customActions.map((action, index) => (
            <MenuItem
              key={index}
              onClick={() => handleAction(action.onClick)}
              sx={{
                '& .MuiListItemText-primary': {
                  color: action.color === 'error' ? '#d32f2f' : action.color === 'success' ? '#2e7d32' : '#000000',
                  fontSize: '14px',
                },
                '&:hover': {
                  bgcolor: action.color === 'error' ? '#ffebee' : action.color === 'success' ? '#e8f5e9' : '#f5f5f5',
                },
              }}
            >
              <ListItemText>{action.label}</ListItemText>
            </MenuItem>
          ))}
          {onDelete && (
            <MenuItem 
                  onClick={() => handleAction(onDelete!)}
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
              )}
        </MenuList>
      </Popover>
    </>
  );
}

