import { Box, Typography, CircularProgress, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useRef, useMemo, useCallback, memo, useState } from 'react';
import type { DirectMessage } from '../../services/api/directMessages';
import DirectMessageItem from './DirectMessageItem';

interface DirectMessageListProps {
  messages: DirectMessage[];
  currentUserId: string | undefined;
  editingMessageId: string | null;
  hoveredMessageId: string | null;
  imageErrors: Set<string>;
  anchorEl: HTMLElement | null;
  lastMessageRef: React.RefObject<HTMLDivElement>;
  editingMessageRef: React.RefObject<HTMLDivElement>;
  messageRefs?: React.MutableRefObject<Map<string, HTMLDivElement>>;
  hasMoreMessages?: boolean;
  isLoadingMore?: boolean;
  isLoading?: boolean;
  onLoadMore?: () => void;
  isLoadingMoreRef?: React.MutableRefObject<boolean>;
  isSubmittingRef?: React.MutableRefObject<boolean>;
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

function DirectMessageList({
  messages,
  currentUserId,
  editingMessageId,
  hoveredMessageId,
  imageErrors,
  anchorEl,
  lastMessageRef,
  editingMessageRef,
  messageRefs,
  hasMoreMessages = false,
  isLoadingMore = false,
  isLoading = false,
  onLoadMore,
  isLoadingMoreRef,
  isSubmittingRef,
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
}: DirectMessageListProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isCurrentUser = useCallback((message: DirectMessage) => {
    return message.senderId === currentUserId;
  }, [currentUserId]);
  
  const handleMessageHover = useCallback((messageId: string) => {
    onMessageHover(messageId);
  }, [onMessageHover]);
  
  const handleMenuClick = useCallback((e: React.MouseEvent<HTMLElement>, messageId: string) => {
    onMenuClick(e, messageId);
  }, [onMenuClick]);
  
  const handleEditClick = useCallback((messageId: string) => {
    onEditClick(messageId);
  }, [onEditClick]);
  
  const handleDeleteClick = useCallback((messageId: string) => {
    onDeleteClick(messageId);
  }, [onDeleteClick]);
  
  // Memoize message items to prevent unnecessary re-renders
  const messageItems = useMemo(() => {
    return messages.map((message, index) => {
      const isOwn = isCurrentUser(message);
      const isEditing = editingMessageId === message.id;
      const isHovered = hoveredMessageId === message.id;
      const isLastMessage = index === messages.length - 1;

      return (
        <Box
          key={message.id}
          ref={(el: HTMLDivElement | null) => {
            if (el && messageRefs) {
              messageRefs.current.set(message.id, el);
            }
          }}
        >
          <DirectMessageItem
            message={message}
            isEditing={isEditing}
            isHovered={isHovered}
            isLastMessage={isLastMessage}
            imageErrors={imageErrors}
            anchorEl={anchorEl}
            onMouseEnter={() => isOwn && !isEditing && handleMessageHover(message.id)}
            onMouseLeave={onMessageLeave}
            onMenuClick={(e) => handleMenuClick(e, message.id)}
            onMenuClose={onMenuClose}
            onEditClick={() => handleEditClick(message.id)}
            onDeleteClick={() => handleDeleteClick(message.id)}
            onImageError={onImageError}
            getFileIcon={getFileIcon}
            isImageFile={isImageFile}
            formatFileSize={formatFileSize}
            lastMessageRef={isLastMessage ? lastMessageRef : null}
            editingMessageRef={isEditing ? editingMessageRef : null}
          />
        </Box>
      );
    });
  }, [messages, isCurrentUser, editingMessageId, hoveredMessageId, imageErrors, anchorEl, messageRefs, lastMessageRef, editingMessageRef, handleMessageHover, onMessageLeave, handleMenuClick, onMenuClose, handleEditClick, handleDeleteClick, onImageError, getFileIcon, isImageFile, formatFileSize]);

  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialLoadRef = useRef(true);
  const hasScrolledToBottomRef = useRef(false);
  const previousMessagesLengthRef = useRef(0);
  const [messagesOpacity, setMessagesOpacity] = useState(0);

  // Reset state when messages array becomes empty (switching conversations)
  useEffect(() => {
    if (messages.length === 0) {
      isInitialLoadRef.current = true;
      hasScrolledToBottomRef.current = false;
      previousMessagesLengthRef.current = 0;
      setMessagesOpacity(0); // Reset opacity when switching conversations
    }
  }, [messages.length]);

  // Control opacity based on loading state
  useEffect(() => {
    if (isLoading) {
      // Hide messages when loading
      setMessagesOpacity(0);
    } else if (messages.length > 0) {
      // Fade in messages after loading is complete
      // Small delay to ensure scroll is complete
      setTimeout(() => {
        setMessagesOpacity(1);
      }, 50);
    }
  }, [isLoading, messages.length]);

  // Handle initial load: scroll to bottom immediately
  useEffect(() => {
    // Skip if loading more messages or submitting
    if (isLoadingMoreRef?.current || isSubmittingRef?.current) {
      if (messages.length > 0) {
        previousMessagesLengthRef.current = messages.length;
      }
      return;
    }
    
    // Detect initial load: messages went from 0 to > 0
    const isInitialLoad = previousMessagesLengthRef.current === 0 && messages.length > 0;
    
    if (isInitialLoad && containerRef.current && isInitialLoadRef.current && !hasScrolledToBottomRef.current) {
      // Scroll to bottom immediately
      const scrollToBottom = () => {
        if (containerRef.current && !isSubmittingRef?.current && !isLoadingMoreRef?.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
          hasScrolledToBottomRef.current = true;
          isInitialLoadRef.current = false;
        }
      };
      
      // Scroll immediately - use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        scrollToBottom();
        requestAnimationFrame(() => {
          scrollToBottom();
        });
      });
      
      previousMessagesLengthRef.current = messages.length;
    } else if (messages.length > 0) {
      previousMessagesLengthRef.current = messages.length;
    }
  }, [messages.length, isLoadingMoreRef, isSubmittingRef]);

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
        if (currentScrollTop <= 100 && !isLoadingMoreRef?.current && hasMoreMessages) {
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
        minHeight: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        p: 2,
        bgcolor: '#f0f2f5',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        width: '100%',
        position: 'relative',
        // On mobile: add padding to account for fixed header and input
        pt: { xs: '72px', md: 2 }, // 60px header + 12px spacing on mobile
        pb: { xs: '88px', md: 2 }, // 80px input + 8px spacing on mobile
      }}
    >
      {messages.length === 0 && !isLoading ? (
        // Không có tin nhắn
        <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
          Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
        </Typography>
      ) : (
        // Hiển thị tin nhắn với fade-in effect (ẩn khi đang loading)
        <Box
          sx={{
            opacity: messagesOpacity,
            transition: 'opacity 0.3s ease-in-out',
          }}
        >
          {/* Render messages invisibly while loading to calculate scrollHeight */}
          {isLoading && messages.length > 0 && (
            <Box sx={{ position: 'absolute', visibility: 'hidden', pointerEvents: 'none', width: '100%', top: 0, left: 0, p: 2 }}>
              {messageItems}
            </Box>
          )}
          
          {/* Loading indicator when loading more messages */}
          {isLoadingMore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Đang tải thêm tin nhắn cũ...
              </Typography>
            </Box>
          )}
          {messageItems}
        </Box>
      )}

      <div ref={lastMessageRef} />
    </Box>
  );
}

// Custom comparison function for memo to prevent unnecessary re-renders
export default memo(DirectMessageList, (prevProps, nextProps) => {
  // Compare primitive props
  if (prevProps.currentUserId !== nextProps.currentUserId) return false;
  if (prevProps.editingMessageId !== nextProps.editingMessageId) return false;
  if (prevProps.hoveredMessageId !== nextProps.hoveredMessageId) return false;
  if (prevProps.anchorEl !== nextProps.anchorEl) return false;
  if (prevProps.hasMoreMessages !== nextProps.hasMoreMessages) return false;
  if (prevProps.isLoadingMore !== nextProps.isLoadingMore) return false;
  if (prevProps.isLoading !== nextProps.isLoading) return false;
  if (prevProps.lastMessageRef !== nextProps.lastMessageRef) return false;
  if (prevProps.editingMessageRef !== nextProps.editingMessageRef) return false;
  if (prevProps.messageRefs !== nextProps.messageRefs) return false;
  if (prevProps.isLoadingMoreRef !== nextProps.isLoadingMoreRef) return false;
  if (prevProps.isSubmittingRef !== nextProps.isSubmittingRef) return false;

  // Compare messages array - only if length or content changed
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (prevProps.messages.some((msg, idx) => {
    const nextMsg = nextProps.messages[idx];
    if (!nextMsg) return true;
    return msg.id !== nextMsg.id || 
           msg.content !== nextMsg.content || 
           msg.updatedAt !== nextMsg.updatedAt ||
           msg.status !== nextMsg.status ||
           msg.attachments.length !== nextMsg.attachments.length;
  })) return false;

  // Compare imageErrors Set - check size and content
  if (prevProps.imageErrors.size !== nextProps.imageErrors.size) return false;
  for (const id of prevProps.imageErrors) {
    if (!nextProps.imageErrors.has(id)) return false;
  }

  // Handler functions should be stable (useCallback), so we can skip deep comparison
  // If handlers change reference but are functionally the same, that's okay
  // The real check is if the props they depend on (like messages) haven't changed

  return true; // Props are equal, skip re-render
});

