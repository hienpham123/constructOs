import { Box, Typography, Avatar, IconButton, Popover, MenuList, MenuItem, useMediaQuery, useTheme } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faTrash, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { type DirectConversationDetail } from '../../services/api/directMessages';

interface DirectChatHeaderProps {
  conversation: DirectConversationDetail | null;
  onDeleteConversation: () => void;
}

function DirectChatHeader({ conversation, onDeleteConversation }: DirectChatHeaderProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleBackClick = () => {
    navigate('/chats');
  };

  if (!conversation) {
    return (
      <Box
        sx={{
          height: 60,
          borderBottom: '1px solid #e4e6eb',
          display: 'flex',
          alignItems: 'center',
          px: 2,
          bgcolor: 'white',
        }}
      >
        <Typography variant="body1" sx={{ color: '#65676b' }}>
          Chọn một cuộc trò chuyện
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: 60,
        minHeight: 60,
        flexShrink: 0,
        borderBottom: '1px solid #e4e6eb',
        display: 'flex',
        alignItems: 'center',
        px: 2,
        bgcolor: 'white',
        width: '100%',
        // Fixed on mobile
        position: { xs: 'fixed', md: 'relative' },
        top: { xs: 0, md: 'auto' },
        left: { xs: 0, md: 'auto' },
        right: { xs: 0, md: 'auto' },
        zIndex: { xs: 99, md: 'auto' },
      }}
    >
      {/* Back button for mobile */}
      {isMobile && (
        <IconButton
          onClick={handleBackClick}
          sx={{
            mr: 1,
            color: '#65676b',
            minWidth: 40,
            minHeight: 40,
            '&:hover': {
              bgcolor: '#f0f2f5',
            },
          }}
        >
          <FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: '18px' }} />
        </IconButton>
      )}
      <Avatar
        src={conversation.otherUser.avatar || undefined}
        sx={{
          bgcolor: '#1877f2',
          width: 40,
          height: 40,
          mr: 1.5,
        }}
      >
        {conversation.otherUser.name[0]?.toUpperCase() || 'U'}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            fontSize: '0.9375rem',
            color: '#050505',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {conversation.otherUser.name}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: '#65676b',
            fontSize: '0.75rem',
            display: 'block',
          }}
        >
          {conversation.otherUser.email}
        </Typography>
      </Box>
      <IconButton
        size="small"
        onClick={handleMenuClick}
        sx={{
          color: '#65676b',
          '&:hover': {
            bgcolor: '#f0f2f5',
          },
        }}
      >
        <FontAwesomeIcon icon={faEllipsisV} />
      </IconButton>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleMenuClose}
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
            minWidth: '180px',
            padding: '4px 0',
            bgcolor: '#ffffff',
          },
        }}
      >
        <MenuList dense>
          <MenuItem
            onClick={() => {
              handleMenuClose();
              onDeleteConversation();
            }}
            sx={{
              color: '#d32f2f',
              '&:hover': {
                bgcolor: '#ffebee',
              },
            }}
          >
            <FontAwesomeIcon icon={faTrash} style={{ marginRight: 8, fontSize: 14 }} />
            Xóa cuộc trò chuyện
          </MenuItem>
        </MenuList>
      </Popover>
    </Box>
  );
}

export default memo(DirectChatHeader);
