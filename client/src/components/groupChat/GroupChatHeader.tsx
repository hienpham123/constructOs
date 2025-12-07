import { Box, Avatar, Typography, IconButton } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import VideocamIcon from '@mui/icons-material/Videocam';
import SearchIcon from '@mui/icons-material/Search';
import FolderIcon from '@mui/icons-material/Folder';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import type { GroupDetail } from '../../services/api/groupChats';

interface GroupChatHeaderProps {
  group: GroupDetail;
  onMembersClick: () => void;
  onMenuClick: (event: React.MouseEvent<HTMLElement>) => void;
}

export default function GroupChatHeader({ group, onMembersClick, onMenuClick }: GroupChatHeaderProps) {
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
      <IconButton size="small" sx={{ color: '#65676b' }}>
        <VideocamIcon fontSize="small" />
      </IconButton>
      <IconButton size="small" sx={{ color: '#65676b' }}>
        <SearchIcon fontSize="small" />
      </IconButton>
      <IconButton size="small" sx={{ color: '#65676b' }}>
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

