import { Box, Typography, CircularProgress } from '@mui/material';
import { useEffect, useRef } from 'react';
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
  editingMessageRef: React.RefObject<HTMLDivElement>;
  hasMoreMessages?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  isLoadingMoreRef?: React.MutableRefObject<boolean>;
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
  editingMessageRef,
  hasMoreMessages = false,
  isLoadingMore = false,
  onLoadMore,
  isLoadingMoreRef,
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

  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialLoadRef = useRef(true);
  const hasScrolledToBottomRef = useRef(false);
  const previousMessagesLengthRef = useRef(0);

  // Reset refs when messages array becomes empty (switching groups)
  useEffect(() => {
    if (messages.length === 0) {
      isInitialLoadRef.current = true;
      hasScrolledToBottomRef.current = false;
      previousMessagesLengthRef.current = 0;
    }
  }, [messages.length]);

  // Set scroll position to bottom when messages are first loaded
  useEffect(() => {
    // Don't auto-scroll if loading more messages
    if (isLoadingMoreRef?.current) {
      return;
    }
    
    // Only scroll on initial load (when messages go from 0 to > 0)
    const isInitialLoad = previousMessagesLengthRef.current === 0 && messages.length > 0;
    
    if (isInitialLoad && containerRef.current && isInitialLoadRef.current && !hasScrolledToBottomRef.current) {
      // Wait for DOM to fully render messages
      const timer = setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
          hasScrolledToBottomRef.current = true;
          isInitialLoadRef.current = false;
        }
      }, 200);
      previousMessagesLengthRef.current = messages.length;
      return () => clearTimeout(timer);
    } else if (messages.length > 0) {
      previousMessagesLengthRef.current = messages.length;
    }
  }, [messages.length, isLoadingMoreRef]); // Only when message count changes (initial load)

  // Auto-load more messages when scrolling to top
  const lastScrollTopRef = useRef(0);
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !hasMoreMessages || isLoadingMore || !onLoadMore) return;

    const handleScroll = () => {
      const currentScrollTop = container.scrollTop;
      // Only check when scrolling up (not down)
      if (currentScrollTop < lastScrollTopRef.current) {
        // Check if scrolled near the top (within 100px)
        if (currentScrollTop <= 100 && !isLoadingMoreRef?.current) {
          onLoadMore();
        }
      }
      lastScrollTopRef.current = currentScrollTop;
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [hasMoreMessages, isLoadingMore, onLoadMore, isLoadingMoreRef]);

  return (
    <Box
      ref={containerRef}
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
        <>
          {/* Loading indicator when loading more messages */}
          {isLoadingMore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Đang tải thêm tin nhắn cũ...
              </Typography>
            </Box>
          )}
          {messages.map((message, index) => {
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
                lastMessageRef={isLastMessage ? lastMessageRef : null}
                editingMessageRef={isEditing ? editingMessageRef : null}
              />
            );
          })}
        </>
      )}

      <div ref={lastMessageRef} />
    </Box>
  );
}

