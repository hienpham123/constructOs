import { Box, Typography, ListItem, ListItemButton, ListItemAvatar, ListItemText, Avatar, Badge } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbtack } from '@fortawesome/free-solid-svg-icons';
import { type GroupChat } from '../../services/api/groupChats';
import { type DirectConversation } from '../../services/api/directMessages';
import { formatZaloTime } from '../../utils/dateFormat';

type UnifiedChatItem = 
  | { type: 'group'; data: GroupChat }
  | { type: 'conversation'; data: DirectConversation };

interface UnifiedChatListItemProps {
  item: UnifiedChatItem;
  isSelected: boolean;
  onGroupClick: (groupId: string) => void;
  onConversationClick: (conversationId: string) => void;
  currentUserId?: string;
}

export default function UnifiedChatListItem({
  item,
  isSelected,
  onGroupClick,
  onConversationClick,
  currentUserId,
}: UnifiedChatListItemProps) {
  const isGroup = item.type === 'group';
  const data = item.data;
  
  const pinned = isGroup ? data.pinned : data.pinned;
  const unreadCount = isGroup ? data.unreadCount : data.unreadCount;
  const avatar = isGroup ? data.avatar : data.otherUser.avatar;
  const name = isGroup ? data.name : data.otherUser.name;
  const lastMessage = isGroup ? data.lastMessage : data.lastMessage;
  const lastMessageTime = isGroup 
    ? (data.lastMessageAt ? formatZaloTime(data.lastMessageAt) : null)
    : (data.lastMessage ? formatZaloTime(data.lastMessage.createdAt) : null);

  const handleClick = () => {
    if (isGroup) {
      onGroupClick(data.id);
    } else {
      onConversationClick(data.id);
    }
  };

  return (
    <ListItem disablePadding>
      <ListItemButton
        onClick={handleClick}
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
            badgeContent={unreadCount > 0 ? unreadCount : 0}
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
              src={avatar || undefined}
              sx={{
                bgcolor: '#1877f2',
                width: 56,
                height: 56,
                fontSize: '1.25rem',
                fontWeight: 600,
              }}
            >
              {name[0]?.toUpperCase() || (isGroup ? 'G' : 'U')}
            </Avatar>
          </Badge>
        </ListItemAvatar>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
              {pinned && (
                <FontAwesomeIcon
                  icon={faThumbtack}
                  style={{
                    fontSize: 14,
                    color: '#e91e63',
                  }}
                />
              )}
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: unreadCount > 0 ? 600 : 500,
                  flex: 1,
                  fontSize: '0.9375rem',
                  color: '#050505',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {name}
              </Typography>
              {lastMessageTime && (
                <Typography
                  variant="caption"
                  sx={{
                    color: '#65676b',
                    fontSize: '0.75rem',
                    ml: 'auto',
                    flexShrink: 0,
                  }}
                >
                  {lastMessageTime}
                </Typography>
              )}
            </Box>
          }
          secondary={
            <Box>
              {lastMessage ? (
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: unreadCount > 0 ? '#050505' : '#65676b',
                    fontWeight: unreadCount > 0 ? 500 : 400,
                    fontSize: '0.8125rem',
                  }}
                >
                  {isGroup ? (
                    <>
                      <Box component="span" sx={{ fontWeight: 500 }}>
                        {lastMessage.userName === currentUserId ? 'Bạn' : lastMessage.userName}
                      </Box>
                      : {lastMessage.content}
                    </>
                  ) : (
                    lastMessage.content || 'Đã gửi một tệp'
                  )}
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
