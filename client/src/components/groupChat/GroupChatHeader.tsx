import { Box, Avatar, Typography, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faSearch, faFolder, faEllipsisV, faArrowLeft, faUser } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { memo } from 'react';
import type { GroupDetail } from '../../services/api/groupChats';

interface GroupChatHeaderProps {
  group: GroupDetail;
  onMembersClick: () => void;
  onMenuClick: (event: React.MouseEvent<HTMLElement>) => void;
  onSearchClick: () => void;
  onFilesClick: () => void;
}

function GroupChatHeader({ group, onMembersClick, onMenuClick, onSearchClick, onFilesClick }: GroupChatHeaderProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/chats');
  };

  return (
    <Box
      sx={{
        bgcolor: 'white',
        borderBottom: '1px solid #e4e6eb',
        display: 'flex',
        alignItems: 'center',
        px: 2,
        py: 1.5,
        gap: 1.5,
        // Fixed on mobile
        position: { xs: 'fixed', md: 'relative' },
        top: { xs: 0, md: 'auto' },
        left: { xs: 0, md: 'auto' },
        right: { xs: 0, md: 'auto' },
        zIndex: { xs: 99, md: 'auto' },
        width: { xs: '100%', md: 'auto' },
        height: { xs: '60px', md: 'auto' },
        minHeight: { xs: '60px', md: 'auto' },
      }}
    >
      {isMobile && (
        <IconButton
          size="small"
          onClick={handleBack}
          sx={{ color: '#65676b', mr: -0.5 }}
        >
          <FontAwesomeIcon icon={faArrowLeft} style={{ fontSize: '16px' }} />
        </IconButton>
      )}
      <Avatar
        src={group.avatar || undefined}
        sx={{
          bgcolor: '#1877f2',
          width: 40,
          height: 40,
          fontSize: '1rem',
          fontWeight: 600,
        }}
      >
        {group.name[0]?.toUpperCase() || 'G'}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            fontSize: '1.0625rem',
            color: '#1877f2',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            mb: 0.25,
          }}
        >
          {group.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <FontAwesomeIcon 
            icon={faUser} 
            style={{ 
              fontSize: '12px', 
              color: '#65676b' 
            }} 
          />
          <Typography
            variant="caption"
            sx={{
              fontSize: '0.8125rem',
              color: '#65676b',
            }}
          >
            {group.members?.length || 0} thành viên
          </Typography>
        </Box>
      </Box>
      <IconButton
        size="small"
        onClick={onMembersClick}
        sx={{ color: '#65676b' }}
      >
        <FontAwesomeIcon icon={faUserPlus} style={{ fontSize: '16px' }} />
      </IconButton>
      <IconButton size="small" onClick={onSearchClick} sx={{ color: '#65676b' }}>
        <FontAwesomeIcon icon={faSearch} style={{ fontSize: '16px' }} />
      </IconButton>
      <IconButton size="small" onClick={onFilesClick} sx={{ color: '#65676b' }}>
        <FontAwesomeIcon icon={faFolder} style={{ fontSize: '16px' }} />
      </IconButton>
      <IconButton
        size="small"
        onClick={onMenuClick}
        sx={{ color: '#65676b' }}
      >
        <FontAwesomeIcon icon={faEllipsisV} style={{ fontSize: '16px' }} />
      </IconButton>
    </Box>
  );
}

export default memo(GroupChatHeader);
