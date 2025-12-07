import { Box, Typography, Avatar } from '@mui/material';
import type { GroupMessage } from '../../services/api/groupChats';

interface SearchResultsProps {
  results: GroupMessage[];
  searchQuery: string;
  onMessageClick: (message: GroupMessage) => void;
}

export default function SearchResults({ results, searchQuery, onMessageClick }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Không tìm thấy tin nhắn nào
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 600, color: '#65676b' }}>
        Tin nhắn ({results.length})
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {results.map((message) => {
          const messageDate = new Date(message.createdAt);
          const now = new Date();
          const diffMs = now.getTime() - messageDate.getTime();
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
          const diffDays = Math.floor(diffHours / 24);
          
          let timeLabel = '';
          if (diffHours < 1) {
            timeLabel = 'Vừa xong';
          } else if (diffHours < 24) {
            timeLabel = `${diffHours} giờ`;
          } else if (diffDays < 7) {
            timeLabel = `${diffDays} ngày`;
          } else {
            const day = String(messageDate.getDate()).padStart(2, '0');
            const month = String(messageDate.getMonth() + 1).padStart(2, '0');
            const year = String(messageDate.getFullYear()).slice(-2);
            timeLabel = `${day}/${month}/${year}`;
          }

          // Highlight search query in content
          const highlightContent = (text: string, query: string) => {
            if (!query || !text) return text;
            const regex = new RegExp(`(${query})`, 'gi');
            const parts = text.split(regex);
            return parts.map((part, index) =>
              regex.test(part) ? (
                <mark key={index} style={{ backgroundColor: '#fff3cd', padding: '0 2px' }}>
                  {part}
                </mark>
              ) : (
                part
              )
            );
          };

          return (
            <Box
              key={message.id}
              onClick={() => onMessageClick(message)}
              sx={{
                display: 'flex',
                gap: 1.5,
                p: 1.5,
                borderRadius: 1,
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: '#f5f5f5',
                },
              }}
            >
              <Avatar
                src={message.userAvatar || undefined}
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: '#1877f2',
                  fontSize: '0.875rem',
                  flexShrink: 0,
                }}
              >
                {message.userName?.[0]?.toUpperCase() || 'U'}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#050505' }}>
                    {message.userName || 'Người dùng'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#65676b' }}>
                    {timeLabel}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#050505',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {highlightContent(message.content || '', searchQuery)}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

