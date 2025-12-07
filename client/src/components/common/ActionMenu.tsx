import { useState, MouseEvent } from 'react';
import { IconButton, Popover, MenuList, MenuItem, ListItemText, Tooltip } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

export interface ActionItem {
  key: string;
  text: string;
  onClick: () => void;
  condition?: boolean | ((row?: any) => boolean);
  color?: 'default' | 'success' | 'error' | 'warning' | 'info';
}

interface ActionMenuProps {
  actions: ActionItem[];
}

export default function ActionMenu({ actions }: ActionMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAction = (onClick: () => void) => {
    onClick();
    handleClose();
  };

  // Filter actions based on condition
  const visibleActions = actions.filter(action => {
    if (action.condition === undefined || action.condition === true) {
      return true;
    }
    if (typeof action.condition === 'function') {
      return action.condition();
    }
    return action.condition !== false;
  });

  // Don't render if no visible actions
  if (visibleActions.length === 0) {
    return null;
  }

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
          {visibleActions.map((action) => {
            const isError = action.color === 'error';
            const isSuccess = action.color === 'success';
            
            return (
              <MenuItem
                key={action.key}
                onClick={() => handleAction(action.onClick)}
                sx={{
                  '& .MuiListItemText-primary': {
                    color: isError ? '#d32f2f' : isSuccess ? '#2e7d32' : '#000000',
                    fontSize: '14px',
                  },
                  '&:hover': {
                    bgcolor: isError ? '#ffebee' : isSuccess ? '#e8f5e9' : '#f5f5f5',
                  },
                }}
              >
                <ListItemText>{action.text}</ListItemText>
              </MenuItem>
            );
          })}
        </MenuList>
      </Popover>
    </>
  );
}
