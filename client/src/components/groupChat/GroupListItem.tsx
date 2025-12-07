import { Box, Typography, ListItem, ListItemButton, ListItemAvatar, ListItemText, Avatar, Badge } from '@mui/material';
import PushPinIcon from '@mui/icons-material/PushPin';
import { type GroupChat } from '../../services/api/groupChats';
import { formatZaloTime } from '../../utils/dateFormat';
import { useAuthStore } from '../../stores/authStore';

interface GroupListItemProps {
  group: GroupChat;
  isSelected: boolean;
  onClick: (groupId: string) => void;
}

export default function GroupListItem({ group, isSelected, onClick }: GroupListItemProps) {
  const { user } = useAuthStore();

  return (
    <ListItem disablePadding>
      <ListItemButton
        onClick={() => onClick(group.id)}
        selected={isSelected}
        sx={{
          py: 1.5,
          px: 2,
          bgcolor: isSelected ? '#e7f3ff' : 'transparent',
          borderLeft: isSelected ? '3px solid #1877f2' : '3px solid transparent',
          '&:hover': {
            bgcolor: isSelected ? '#e7f3ff' : '#f0f2f5',
          },
          '&.Mui-selected': {
            bgcolor: '#e7f3ff',
            '&:hover': {
              bgcolor: '#e7f3ff',
            },
          },
          transition: 'all 0.2s',
        }}
      >
        <ListItemAvatar sx={{ minWidth: 56, mr: 2 }}>
          <Badge
            badgeContent={group.unreadCount > 0 ? group.unreadCount : 0}
            color="error"
            max={99}
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.7rem',
                minWidth: '18px',
                height: '18px',
                padding: '0 4px',
                right: 2,
                top: 2,
              },
            }}
          >
            <Avatar
              src={group.avatar || undefined}
              sx={{
                bgcolor: '#1877f2',
                width: 56,
                height: 56,
                fontSize: '1.25rem',
                fontWeight: 600,
              }}
            >
              {group.name[0]?.toUpperCase() || 'G'}
            </Avatar>
          </Badge>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
              {group.pinned && (
                <PushPinIcon
                  sx={{
                    fontSize: 14,
                    color: '#e91e63',
                  }}
                />
              )}
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: group.unreadCount > 0 ? 600 : 500,
                  flex: 1,
                  fontSize: '0.9375rem',
                  color: '#050505',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {group.name}
              </Typography>
              {group.lastMessageAt && (
                <Typography
                  variant="caption"
                  sx={{
                    color: '#65676b',
                    fontSize: '0.75rem',
                    ml: 'auto',
                    flexShrink: 0,
                  }}
                >
                  {formatZaloTime(group.lastMessageAt)}
                </Typography>
              )}
            </Box>
          }
          secondary={
            <Box>
              {group.lastMessage ? (
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: group.unreadCount > 0 ? '#050505' : '#65676b',
                    fontWeight: group.unreadCount > 0 ? 500 : 400,
                    fontSize: '0.8125rem',
                  }}
                >
                  <Box component="span" sx={{ fontWeight: 500 }}>
                    {group.lastMessage.userName === user?.name ? 'Bạn' : group.lastMessage.userName}
                  </Box>
                  : {group.lastMessage.content}
                </Typography>
              ) : (
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    color: '#65676b',
                    fontSize: '0.8125rem',
                    fontStyle: 'italic',
                  }}
                >
                  Chưa có tin nhắn
                </Typography>
              )}
            </Box>
          }
        />
      </ListItemButton>
    </ListItem>
  );
}
