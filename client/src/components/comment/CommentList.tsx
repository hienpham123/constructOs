import { Box, Typography, CircularProgress } from '@mui/material';
import { useEffect, useRef } from 'react';
import CommentItem from './CommentItem';

interface Attachment {
  id: string;
  fileType: string;
  originalFilename: string;
  fileSize: number;
  fileUrl: string;
}

interface BaseComment {
  id: string;
  content?: string;
  attachments: Attachment[];
  createdBy: string;
  createdByName?: string;
  createdByAvatar?: string | null;
  createdAt: string;
}

interface CommentListProps<T extends BaseComment = BaseComment> {
  comments: T[];
  currentUserId?: string;
  editingCommentId: string | null;
  hoveredCommentId: string | null;
  imageErrors: Set<string>;
  anchorEl: HTMLElement | null;
  hoveredMoreButtonId: string | null;
  isLoading: boolean;
  hasMoreComments?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  onMessageHover: (commentId: string) => void;
  onMessageLeave: () => void;
  onMoreClick: (event: React.MouseEvent<HTMLElement>, commentId: string) => void;
  onPopoverClose: () => void;
  onEditClick: (comment: T) => void;
  onDeleteClick: (commentId: string) => void;
  onImageError: (attachmentId: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export default function CommentList<T extends BaseComment = BaseComment>({
  comments,
  currentUserId,
  editingCommentId,
  hoveredCommentId,
  imageErrors,
  anchorEl,
  hoveredMoreButtonId,
  isLoading,
  hasMoreComments = false,
  isLoadingMore = false,
  onLoadMore,
  onMessageHover,
  onMessageLeave,
  onMoreClick,
  onPopoverClose,
  onEditClick,
  onDeleteClick,
  onImageError,
  messagesEndRef,
}: CommentListProps<T>) {
  const isCurrentUser = (comment: T) => {
    return comment.createdBy === currentUserId;
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollTopRef = useRef(0);
  const isLoadingMoreRef = useRef(false);

  // Auto-load more comments when scrolling to top
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !hasMoreComments || isLoadingMore || !onLoadMore) return;

    const handleScroll = () => {
      const currentScrollTop = container.scrollTop;
      // Only check when scrolling up (not down)
      if (currentScrollTop < lastScrollTopRef.current) {
        // Check if scrolled near the top (within 100px)
        if (currentScrollTop <= 100 && !isLoadingMoreRef.current) {
          isLoadingMoreRef.current = true;
          onLoadMore();
          // Reset ref after a delay
          setTimeout(() => {
            isLoadingMoreRef.current = false;
          }, 1000);
        }
      }
      lastScrollTopRef.current = currentScrollTop;
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [hasMoreComments, isLoadingMore, onLoadMore]);

  return (
    <Box
      ref={containerRef}
      data-comments-container
      sx={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        p: 2,
        bgcolor: '#f0f0f0',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
      }}
    >
      {isLoading ? (
        <Typography>Đang tải...</Typography>
      ) : comments.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
          Chưa có comment nào. Hãy bắt đầu cuộc trò chuyện!
        </Typography>
      ) : (
        <>
          {/* Loading indicator when loading more comments */}
          {isLoadingMore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Đang tải thêm comment cũ...
              </Typography>
            </Box>
          )}
          {comments.map((comment) => {
          const isOwn = isCurrentUser(comment);
          const isEditing = editingCommentId === comment.id;
          const isHovered = hoveredCommentId === comment.id;
          const isPopoverOpen = Boolean(anchorEl) && hoveredMoreButtonId === comment.id;

          return (
            <CommentItem
              key={comment.id}
              content={comment.content}
              attachments={comment.attachments}
              createdBy={comment.createdBy}
              createdByName={comment.createdByName}
              createdByAvatar={comment.createdByAvatar ?? undefined}
              createdAt={comment.createdAt}
              isOwn={isOwn}
              isEditing={isEditing}
              isHovered={isHovered}
              imageErrors={imageErrors}
              anchorEl={isPopoverOpen ? anchorEl : null}
              onMouseEnter={() => isOwn && !isEditing && onMessageHover(comment.id)}
              onMouseLeave={onMessageLeave}
              onMoreClick={(e) => onMoreClick(e, comment.id)}
              onPopoverClose={onPopoverClose}
              onEditClick={() => onEditClick(comment)}
              onDeleteClick={() => onDeleteClick(comment.id)}
              onImageError={onImageError}
            />
          );
        })}
        </>
      )}
      <div ref={messagesEndRef} />
    </Box>
  );
}

