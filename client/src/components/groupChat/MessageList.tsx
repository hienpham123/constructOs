import { Box, Typography } from '@mui/material';
import type { GroupMessage } from '../../services/api/groupChats';
import MessageItem from './MessageItem';

interface MessageListProps {
  messages: GroupMessage[];
  currentUserId: string | undefined;
  editingMessageId: string | null;
  hoveredMessageId: string | null;
  imageErrors: Set<string>;
  anchorEl: HTMLElement | null;
  lastMessageRef: React.RefObject<HTMLDivElement>;
  onMessageHover: (messageId: string) => void;
  onMessageLeave: () => void;
  onMenuClick: (event: React.MouseEvent<HTMLElement>, messageId: string) => void;
  onMenuClose: () => void;
  onEditClick: (messageId: string) => void;
  onDeleteClick: (messageId: string) => void;
  onImageError: (attachmentId: string) => void;
  getFileIcon: (fileType: string) => React.ReactNode;
  isImageFile: (fileType: string, filename: string) => boolean;
  formatFileSize: (bytes: number) => string;
}

export default function MessageList({
  messages,
  currentUserId,
  editingMessageId,
  hoveredMessageId,
  imageErrors,
  anchorEl,
  lastMessageRef,
  onMessageHover,
  onMessageLeave,
  onMenuClick,
  onMenuClose,
  onEditClick,
  onDeleteClick,
  onImageError,
  getFileIcon,
  isImageFile,
  formatFileSize,
}: MessageListProps) {
  const isCurrentUser = (message: GroupMessage) => {
    return message.userId === currentUserId;
  };

  return (
    <Box
      data-messages-container
      sx={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        p: 2,
        bgcolor: '#f0f2f5',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      {messages.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
          Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
        </Typography>
      ) : (
        messages.map((message, index) => {
          const isOwn = isCurrentUser(message);
          const isEditing = editingMessageId === message.id;
          const isHovered = hoveredMessageId === message.id;
          const isLastMessage = index === messages.length - 1;

          return (
            <MessageItem
              key={message.id}
              message={message}
              isOwn={isOwn}
              isEditing={isEditing}
              isHovered={isHovered}
              isLastMessage={isLastMessage}
              imageErrors={imageErrors}
              anchorEl={anchorEl}
              onMouseEnter={() => isOwn && !isEditing && onMessageHover(message.id)}
              onMouseLeave={onMessageLeave}
              onMenuClick={(e) => onMenuClick(e, message.id)}
              onMenuClose={onMenuClose}
              onEditClick={() => onEditClick(message.id)}
              onDeleteClick={() => onDeleteClick(message.id)}
              onImageError={onImageError}
              getFileIcon={getFileIcon}
              isImageFile={isImageFile}
              formatFileSize={formatFileSize}
              lastMessageRef={lastMessageRef}
            />
          );
        })
      )}

      <div ref={lastMessageRef} />
    </Box>
  );
}

