import { Box, Avatar, Typography, IconButton, useMediaQuery, useTheme } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import FolderIcon from '@mui/icons-material/Folder';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import type { GroupDetail } from '../../services/api/groupChats';

interface GroupChatHeaderProps {
  group: GroupDetail;
  onMembersClick: () => void;
  onMenuClick: (event: React.MouseEvent<HTMLElement>) => void;
  onSearchClick: () => void;
  onFilesClick: () => void;
}

export default function GroupChatHeader({ group, onMembersClick, onMenuClick, onSearchClick, onFilesClick }: GroupChatHeaderProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/group-chats');
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
      }}
    >
      {isMobile && (
        <IconButton
          size="small"
          onClick={handleBack}
          sx={{ color: '#65676b', mr: -0.5 }}
        >
          <ArrowBackIcon fontSize="small" />
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
            fontSize: '0.9375rem',
            color: '#050505',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {group.name}
        </Typography>
      </Box>
      <IconButton
        size="small"
        onClick={onMembersClick}
        sx={{ color: '#65676b' }}
      >
        <PersonAddIcon fontSize="small" />
      </IconButton>
      <IconButton size="small" onClick={onSearchClick} sx={{ color: '#65676b' }}>
        <SearchIcon fontSize="small" />
      </IconButton>
      <IconButton size="small" onClick={onFilesClick} sx={{ color: '#65676b' }}>
        <FolderIcon fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        onClick={onMenuClick}
        sx={{ color: '#65676b' }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

